'use client'

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import dynamic from 'next/dynamic'
import type Konva from 'konva'
import type { CanvasState, CanvasElement, CanvasBackground } from '@/hooks/useCanvas'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CanvasProps {
  state: CanvasState
  selectedId: string | null
  zoom: number
  stageRef: React.RefObject<Konva.Stage>
  onSelect: (id: string | null) => void
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void
}

interface SnapLine {
  points: number[]
  orientation: 'vertical' | 'horizontal'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a CSS-style angle (0 = bottom, 90 = right, clockwise) into Konva
 *  linearGradient start/end points expressed as fractions of width/height. */
function gradientPoints(
  angleDeg: number,
  width: number,
  height: number
): { start: { x: number; y: number }; end: { x: number; y: number } } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // Project onto the rectangle to find the extent
  const halfW = width / 2
  const halfH = height / 2

  const length =
    Math.abs(cos) * width + Math.abs(sin) * height

  const dx = (cos * length) / 2
  const dy = (sin * length) / 2

  return {
    start: { x: halfW - dx, y: halfH - dy },
    end: { x: halfW + dx, y: halfH + dy },
  }
}

const SNAP_THRESHOLD = 8

// ---------------------------------------------------------------------------
// Inner Konva component – only imported on the client via dynamic()
// ---------------------------------------------------------------------------

function CanvasInner({
  state,
  selectedId,
  zoom,
  stageRef,
  onSelect,
  onElementUpdate,
}: CanvasProps) {
  // We lazily require react-konva so this module never touches the server.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {
    Stage,
    Layer,
    Rect,
    Circle,
    Ellipse,
    Line,
    Star,
    Text,
    Image: KonvaImage,
    Transformer,
    Group,
  } = require('react-konva') as typeof import('react-konva')

  const transformerRef = useRef<Konva.Transformer>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [snapLines, setSnapLines] = useState<SnapLine[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({})

  // ---- Observe container size ------------------------------------------

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerSize({ width, height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ---- Compute display scale -------------------------------------------

  const scale = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return 1
    const fitRatio = Math.min(
      containerSize.width / state.width,
      containerSize.height / state.height
    )
    return fitRatio * zoom
  }, [containerSize, state.width, state.height, zoom])

  // ---- Attach / detach Transformer to the selected node ----------------

  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    const stage = stageRef.current
    if (!stage) return

    if (selectedId && editingId !== selectedId) {
      const node = stage.findOne(`#${selectedId}`)
      if (node) {
        tr.nodes([node])
        tr.getLayer()?.batchDraw()
        return
      }
    }
    tr.nodes([])
    tr.getLayer()?.batchDraw()
  }, [selectedId, editingId, stageRef])

  // ---- Load images used by elements or background ----------------------

  useEffect(() => {
    const srcs: string[] = []
    if (state.background.type === 'image' && state.background.imageSrc) {
      srcs.push(state.background.imageSrc)
    }
    state.elements.forEach((el) => {
      if (el.type === 'image' && el.src) srcs.push(el.src)
    })

    const uniqueSrcs = [...new Set(srcs)]
    uniqueSrcs.forEach((src) => {
      if (loadedImages[src]) return
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [src]: img }))
      }
    })
    // We intentionally only react to state changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.background, state.elements])

  // ---- Stage click – deselect ------------------------------------------

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        onSelect(null)
        setEditingId(null)
      }
    },
    [onSelect]
  )

  // ---- Element drag with snap guides -----------------------------------

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, el: CanvasElement) => {
      const node = e.target
      const cx = node.x() + node.width() / 2
      const cy = node.y() + node.height() / 2
      const canvasCx = state.width / 2
      const canvasCy = state.height / 2

      const lines: SnapLine[] = []

      if (Math.abs(cx - canvasCx) < SNAP_THRESHOLD) {
        node.x(canvasCx - node.width() / 2)
        lines.push({
          points: [canvasCx, 0, canvasCx, state.height],
          orientation: 'vertical',
        })
      }

      if (Math.abs(cy - canvasCy) < SNAP_THRESHOLD) {
        node.y(canvasCy - node.height() / 2)
        lines.push({
          points: [0, canvasCy, state.width, canvasCy],
          orientation: 'horizontal',
        })
      }

      setSnapLines(lines)
    },
    [state.width, state.height]
  )

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, el: CanvasElement) => {
      setSnapLines([])
      onElementUpdate(el.id, {
        x: e.target.x(),
        y: e.target.y(),
      })
    },
    [onElementUpdate]
  )

  // ---- Transform end ---------------------------------------------------

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>, el: CanvasElement) => {
      const node = e.target
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()

      // Reset scale to 1 and bake into width/height
      node.scaleX(1)
      node.scaleY(1)

      const updates: Partial<CanvasElement> = {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      }

      if (el.type === 'text') {
        updates.fontSize = Math.max(1, (el.fontSize || 16) * scaleY)
      }

      onElementUpdate(el.id, updates)
    },
    [onElementUpdate]
  )

  // ---- Double-click to edit text ---------------------------------------

  const handleTextDblClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, el: CanvasElement) => {
      if (el.type !== 'text') return
      setEditingId(el.id)
      setEditText(el.text || '')
    },
    []
  )

  const commitTextEdit = useCallback(() => {
    if (editingId) {
      onElementUpdate(editingId, { text: editText })
      setEditingId(null)
      setEditText('')
    }
  }, [editingId, editText, onElementUpdate])

  // ---- Render background -----------------------------------------------

  const renderBackground = () => {
    const bg = state.background

    if (bg.type === 'solid') {
      return (
        <Rect
          x={0}
          y={0}
          width={state.width}
          height={state.height}
          fill={bg.color || '#ffffff'}
          listening={false}
        />
      )
    }

    if (bg.type === 'gradient' && bg.gradient) {
      const { start, end } = gradientPoints(
        bg.gradient.angle,
        state.width,
        state.height
      )
      return (
        <Rect
          x={0}
          y={0}
          width={state.width}
          height={state.height}
          fillLinearGradientStartPoint={start}
          fillLinearGradientEndPoint={end}
          fillLinearGradientColorStops={[0, bg.gradient.colors[0], 1, bg.gradient.colors[1]]}
          listening={false}
        />
      )
    }

    if (bg.type === 'image' && bg.imageSrc && loadedImages[bg.imageSrc]) {
      const img = loadedImages[bg.imageSrc]
      let imgProps: Record<string, unknown> = {
        x: 0,
        y: 0,
        image: img,
        listening: false,
      }

      const fit = bg.imageFit || 'fill'

      if (fit === 'stretch') {
        imgProps.width = state.width
        imgProps.height = state.height
      } else if (fit === 'fit') {
        const ratio = Math.min(state.width / img.width, state.height / img.height)
        const w = img.width * ratio
        const h = img.height * ratio
        imgProps.width = w
        imgProps.height = h
        imgProps.x = (state.width - w) / 2
        imgProps.y = (state.height - h) / 2
      } else {
        // fill – cover the canvas
        const ratio = Math.max(state.width / img.width, state.height / img.height)
        const w = img.width * ratio
        const h = img.height * ratio
        imgProps.width = w
        imgProps.height = h
        imgProps.x = (state.width - w) / 2
        imgProps.y = (state.height - h) / 2
      }

      return (
        <>
          <Rect x={0} y={0} width={state.width} height={state.height} fill="#000" listening={false} />
          <KonvaImage {...imgProps} />
        </>
      )
    }

    // Fallback
    return (
      <Rect
        x={0}
        y={0}
        width={state.width}
        height={state.height}
        fill="#ffffff"
        listening={false}
      />
    )
  }

  // ---- Render a single element -----------------------------------------

  const renderElement = (el: CanvasElement) => {
    if (!el.visible) return null

    const isSelected = el.id === selectedId
    const isEditing = el.id === editingId
    const commonProps = {
      id: el.id,
      key: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation,
      opacity: el.opacity,
      draggable: !el.locked,
      onClick: () => onSelect(el.id),
      onTap: () => onSelect(el.id),
      onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleDragMove(e, el),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, el),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, el),
      onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleTextDblClick(e, el),
      onDblTap: (e: Konva.KonvaEventObject<MouseEvent>) => handleTextDblClick(e, el),
    }

    // -- Text --
    if (el.type === 'text') {
      return (
        <Text
          {...commonProps}
          text={isEditing ? '' : el.text || ''}
          fontSize={el.fontSize || 16}
          fontFamily={el.fontFamily || 'Arial'}
          fontStyle={el.fontStyle || ''}
          textDecoration={el.textDecoration || ''}
          fill={el.fill || '#000000'}
          align={el.align || 'left'}
          verticalAlign="middle"
          letterSpacing={el.letterSpacing || 0}
          lineHeight={el.lineHeight || 1.2}
          stroke={el.stroke || undefined}
          strokeWidth={el.strokeWidth || 0}
          shadowEnabled={el.shadowEnabled || false}
          shadowColor={el.shadowColor || '#000000'}
          shadowBlur={el.shadowBlur || 0}
          shadowOffsetX={el.shadowOffsetX || 0}
          shadowOffsetY={el.shadowOffsetY || 0}
          offsetX={el.width / 2}
          offsetY={el.height / 2}
        />
      )
    }

    // -- Shape --
    if (el.type === 'shape') {
      const shapeFill = el.fill || '#cccccc'
      const shapeStroke = el.stroke || undefined
      const shapeStrokeWidth = el.strokeWidth || 0

      switch (el.shapeType) {
        case 'circle':
          return (
            <Ellipse
              {...commonProps}
              radiusX={el.width / 2}
              radiusY={el.height / 2}
              fill={shapeFill}
              stroke={shapeStroke}
              strokeWidth={shapeStrokeWidth}
              offsetX={0}
              offsetY={0}
              shadowEnabled={el.shadowEnabled || false}
              shadowColor={el.shadowColor || '#000000'}
              shadowBlur={el.shadowBlur || 0}
              shadowOffsetX={el.shadowOffsetX || 0}
              shadowOffsetY={el.shadowOffsetY || 0}
            />
          )

        case 'triangle': {
          const hw = el.width / 2
          const hh = el.height / 2
          return (
            <Line
              {...commonProps}
              points={[0, -hh, hw, hh, -hw, hh]}
              closed
              fill={shapeFill}
              stroke={shapeStroke}
              strokeWidth={shapeStrokeWidth}
              offsetX={0}
              offsetY={0}
              // Line does not use width/height, remove them so Konva doesn't complain
              width={undefined}
              height={undefined}
              shadowEnabled={el.shadowEnabled || false}
              shadowColor={el.shadowColor || '#000000'}
              shadowBlur={el.shadowBlur || 0}
              shadowOffsetX={el.shadowOffsetX || 0}
              shadowOffsetY={el.shadowOffsetY || 0}
            />
          )
        }

        case 'star':
          return (
            <Star
              {...commonProps}
              numPoints={5}
              innerRadius={el.width / 4}
              outerRadius={el.width / 2}
              fill={shapeFill}
              stroke={shapeStroke}
              strokeWidth={shapeStrokeWidth}
              offsetX={0}
              offsetY={0}
              width={undefined}
              height={undefined}
              shadowEnabled={el.shadowEnabled || false}
              shadowColor={el.shadowColor || '#000000'}
              shadowBlur={el.shadowBlur || 0}
              shadowOffsetX={el.shadowOffsetX || 0}
              shadowOffsetY={el.shadowOffsetY || 0}
            />
          )

        case 'rectangle':
        default:
          return (
            <Rect
              {...commonProps}
              fill={shapeFill}
              stroke={shapeStroke}
              strokeWidth={shapeStrokeWidth}
              cornerRadius={el.cornerRadius || 0}
              offsetX={el.width / 2}
              offsetY={el.height / 2}
              shadowEnabled={el.shadowEnabled || false}
              shadowColor={el.shadowColor || '#000000'}
              shadowBlur={el.shadowBlur || 0}
              shadowOffsetX={el.shadowOffsetX || 0}
              shadowOffsetY={el.shadowOffsetY || 0}
            />
          )
      }
    }

    // -- Image --
    if (el.type === 'image' && el.src && loadedImages[el.src]) {
      const img = loadedImages[el.src]
      return (
        <KonvaImage
          {...commonProps}
          image={img}
          offsetX={el.width / 2}
          offsetY={el.height / 2}
          shadowEnabled={el.shadowEnabled || false}
          shadowColor={el.shadowColor || '#000000'}
          shadowBlur={el.shadowBlur || 0}
          shadowOffsetX={el.shadowOffsetX || 0}
          shadowOffsetY={el.shadowOffsetY || 0}
        />
      )
    }

    return null
  }

  // ---- Textarea overlay for inline text editing ------------------------

  const renderTextEditor = () => {
    if (!editingId) return null
    const el = state.elements.find((e) => e.id === editingId)
    if (!el || el.type !== 'text') return null

    const stage = stageRef.current
    if (!stage) return null

    // Calculate position of the element on screen
    // The element is positioned at el.x, el.y with offset of width/2, height/2
    const topLeftX = el.x - el.width / 2
    const topLeftY = el.y - el.height / 2

    const stageBox = stage.container().getBoundingClientRect()

    // Account for centering offset in wrapper
    const areaLeft = stageBox.left + topLeftX * scale
    const areaTop = stageBox.top + topLeftY * scale

    return (
      <textarea
        autoFocus
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            commitTextEdit()
          }
          // Allow Enter for newlines; use Escape or blur to commit
        }}
        onBlur={commitTextEdit}
        style={{
          position: 'fixed',
          left: areaLeft,
          top: areaTop,
          width: el.width * scale,
          height: el.height * scale,
          fontSize: (el.fontSize || 16) * scale,
          fontFamily: el.fontFamily || 'Arial',
          fontStyle: (el.fontStyle || '').includes('italic') ? 'italic' : 'normal',
          fontWeight: (el.fontStyle || '').includes('bold') ? 'bold' : 'normal',
          textAlign: (el.align as CanvasRenderingContext2D['textAlign']) || 'left',
          color: el.fill || '#000',
          letterSpacing: (el.letterSpacing || 0) * scale,
          lineHeight: el.lineHeight || 1.2,
          border: '2px solid #5c7cfa',
          borderRadius: 2,
          padding: '0px',
          margin: '0px',
          overflow: 'hidden',
          background: 'transparent',
          outline: 'none',
          resize: 'none',
          transformOrigin: 'left top',
          zIndex: 1000,
        }}
      />
    )
  }

  // ---- Canvas wrapper size and centering --------------------------------

  const stageWidth = state.width * scale
  const stageHeight = state.height * scale

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#1e1e2e',
        position: 'relative',
      }}
    >
      {/* Checkerboard / shadow behind the canvas */}
      <div
        style={{
          width: stageWidth,
          height: stageHeight,
          boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
          flexShrink: 0,
        }}
      >
        <Stage
          ref={stageRef}
          width={state.width}
          height={state.height}
          scaleX={scale}
          scaleY={scale}
          style={{
            width: `${stageWidth}px`,
            height: `${stageHeight}px`,
          }}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
        >
          <Layer>
            {/* Background */}
            {renderBackground()}

            {/* Elements */}
            {state.elements.map(renderElement)}

            {/* Snap guide lines */}
            {snapLines.map((line, i) => (
              <Line
                key={`snap-${i}`}
                points={line.points}
                stroke="#5c7cfa"
                strokeWidth={1 / scale}
                dash={[6 / scale, 6 / scale]}
                listening={false}
              />
            ))}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              enabledAnchors={[
                'top-left',
                'top-center',
                'top-right',
                'middle-left',
                'middle-right',
                'bottom-left',
                'bottom-center',
                'bottom-right',
              ]}
              boundBoxFunc={(oldBox: { x: number; y: number; width: number; height: number }, newBox: { x: number; y: number; width: number; height: number }) => {
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox
                }
                return newBox
              }}
              borderStroke="#5c7cfa"
              borderStrokeWidth={1.5 / scale}
              anchorSize={8 / scale}
              anchorStroke="#5c7cfa"
              anchorFill="#ffffff"
              anchorCornerRadius={2 / scale}
            />
          </Layer>
        </Stage>
      </div>

      {/* Text editing overlay */}
      {renderTextEditor()}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public export – wrapped with next/dynamic to disable SSR
// ---------------------------------------------------------------------------

const Canvas = dynamic(() => Promise.resolve(CanvasInner), {
  ssr: false,
  loading: () => (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e1e2e',
        color: '#888',
        fontFamily: 'sans-serif',
        fontSize: 14,
      }}
    >
      Loading canvas...
    </div>
  ),
}) as React.FC<CanvasProps>

export default Canvas
