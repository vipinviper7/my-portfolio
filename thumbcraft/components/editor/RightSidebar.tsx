'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
} from 'lucide-react'
import { CanvasElement } from '@/hooks/useCanvas'
import { FONTS } from '@/lib/fonts'

interface RightSidebarProps {
  elements: CanvasElement[]
  selectedElement: CanvasElement | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
  onDeleteElement: (id: string) => void
  onReorderElements: (fromIndex: number, toIndex: number) => void
  onShowPremium: () => void
}

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-medium uppercase tracking-wider text-surface-500 mb-1">
      {children}
    </span>
  )
}

function ColorPickerButton({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <button
      type="button"
      className="relative h-7 w-7 shrink-0 rounded border border-surface-700 overflow-hidden focus:outline-none focus:ring-1 focus:ring-brand-500"
      style={{ backgroundColor: value }}
      onClick={() => ref.current?.click()}
    >
      <input
        ref={ref}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        tabIndex={-1}
      />
    </button>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-surface-400 w-20 shrink-0 truncate">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 accent-brand-500 bg-surface-800 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500"
      />
      <span className="text-[11px] text-surface-300 w-10 text-right tabular-nums">
        {step < 1 ? value.toFixed(2) : value}
      </span>
    </div>
  )
}

function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-surface-400 w-20 shrink-0 truncate">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)))
        }}
        className="flex-1 h-7 rounded bg-surface-900 border border-surface-700 px-2 text-[12px] text-surface-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Font dropdown
// ---------------------------------------------------------------------------

function FontDropdown({
  value,
  onChange,
  onShowPremium,
}: {
  value: string
  onChange: (family: string) => void
  onShowPremium: () => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = FONTS.find((f) => f.family === value)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full h-8 rounded bg-surface-900 border border-surface-700 px-2 text-[12px] text-surface-200 hover:border-surface-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <span className="truncate" style={{ fontFamily: value }}>
          {selected?.name ?? value}
        </span>
        <ChevronDown size={14} className="shrink-0 text-surface-500" />
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto rounded border border-surface-700 bg-surface-900 shadow-xl">
            {FONTS.map((font) => (
              <button
                key={font.family}
                type="button"
                onClick={() => {
                  if (font.isPremium) {
                    onShowPremium()
                  } else {
                    onChange(font.family)
                  }
                  setOpen(false)
                }}
                className={`flex items-center justify-between w-full px-3 py-1.5 text-left text-[12px] hover:bg-surface-800 transition-colors ${
                  font.family === value
                    ? 'text-brand-400 bg-surface-800/50'
                    : 'text-surface-300'
                }`}
                style={{ fontFamily: font.isPremium ? undefined : font.family }}
              >
                <span className="truncate">{font.name}</span>
                {font.isPremium && (
                  <Lock size={12} className="shrink-0 ml-2 text-surface-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Element Properties Panel
// ---------------------------------------------------------------------------

function TextProperties({
  el,
  onUpdate,
  onShowPremium,
}: {
  el: CanvasElement
  onUpdate: (updates: Partial<CanvasElement>) => void
  onShowPremium: () => void
}) {
  const isBold = el.fontStyle?.includes('bold') ?? false
  const isItalic = el.fontStyle?.includes('italic') ?? false

  const toggleBold = () => {
    const styles = new Set((el.fontStyle ?? 'normal').split(' '))
    if (isBold) {
      styles.delete('bold')
    } else {
      styles.add('bold')
    }
    styles.delete('normal')
    const result = [...styles].join(' ') || 'normal'
    onUpdate({ fontStyle: result })
  }

  const toggleItalic = () => {
    const styles = new Set((el.fontStyle ?? 'normal').split(' '))
    if (isItalic) {
      styles.delete('italic')
    } else {
      styles.add('italic')
    }
    styles.delete('normal')
    const result = [...styles].join(' ') || 'normal'
    onUpdate({ fontStyle: result })
  }

  const isUnderline = el.textDecoration === 'underline'
  const toggleUnderline = () => {
    onUpdate({ textDecoration: isUnderline ? '' : 'underline' })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Font family */}
      <div>
        <SectionLabel>Font</SectionLabel>
        <FontDropdown
          value={el.fontFamily ?? 'Poppins'}
          onChange={(family) => onUpdate({ fontFamily: family })}
          onShowPremium={onShowPremium}
        />
      </div>

      {/* Font size */}
      <div>
        <SectionLabel>Size</SectionLabel>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={12}
            max={200}
            value={el.fontSize ?? 48}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="flex-1 h-1 accent-brand-500 bg-surface-800 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500"
          />
          <input
            type="number"
            min={12}
            max={200}
            value={el.fontSize ?? 48}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (!isNaN(n)) onUpdate({ fontSize: Math.min(200, Math.max(12, n)) })
            }}
            className="w-14 h-7 rounded bg-surface-900 border border-surface-700 px-2 text-[12px] text-surface-200 text-center focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Style toggles */}
      <div>
        <SectionLabel>Style</SectionLabel>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={toggleBold}
            className={`flex items-center justify-center h-7 w-7 rounded border transition-colors ${
              isBold
                ? 'bg-brand-600 border-brand-500 text-white'
                : 'bg-surface-900 border-surface-700 text-surface-400 hover:text-surface-200'
            }`}
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            className={`flex items-center justify-center h-7 w-7 rounded border transition-colors ${
              isItalic
                ? 'bg-brand-600 border-brand-500 text-white'
                : 'bg-surface-900 border-surface-700 text-surface-400 hover:text-surface-200'
            }`}
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onClick={toggleUnderline}
            className={`flex items-center justify-center h-7 w-7 rounded border transition-colors ${
              isUnderline
                ? 'bg-brand-600 border-brand-500 text-white'
                : 'bg-surface-900 border-surface-700 text-surface-400 hover:text-surface-200'
            }`}
          >
            <Underline size={14} />
          </button>
        </div>
      </div>

      {/* Text alignment */}
      <div>
        <SectionLabel>Alignment</SectionLabel>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((a) => {
            const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight
            return (
              <button
                key={a}
                type="button"
                onClick={() => onUpdate({ align: a })}
                className={`flex items-center justify-center h-7 w-7 rounded border transition-colors ${
                  (el.align ?? 'left') === a
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-surface-900 border-surface-700 text-surface-400 hover:text-surface-200'
                }`}
              >
                <Icon size={14} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Fill color */}
      <div>
        <SectionLabel>Fill Color</SectionLabel>
        <div className="flex items-center gap-2">
          <ColorPickerButton
            value={el.fill ?? '#ffffff'}
            onChange={(c) => onUpdate({ fill: c })}
          />
          <span className="text-[11px] text-surface-400 uppercase">
            {el.fill ?? '#ffffff'}
          </span>
        </div>
      </div>

      {/* Letter spacing */}
      <SliderRow
        label="Spacing"
        value={el.letterSpacing ?? 0}
        min={0}
        max={20}
        step={0.5}
        onChange={(v) => onUpdate({ letterSpacing: v })}
      />

      {/* Line height */}
      <SliderRow
        label="Line Height"
        value={el.lineHeight ?? 1.2}
        min={0.8}
        max={3}
        step={0.05}
        onChange={(v) => onUpdate({ lineHeight: v })}
      />

      {/* Text stroke */}
      <div>
        <SectionLabel>Stroke</SectionLabel>
        <div className="flex items-center gap-2 mb-1.5">
          <ColorPickerButton
            value={el.stroke ?? '#000000'}
            onChange={(c) => onUpdate({ stroke: c })}
          />
          <span className="text-[11px] text-surface-400 uppercase">
            {el.stroke ?? '#000000'}
          </span>
        </div>
        <SliderRow
          label="Width"
          value={el.strokeWidth ?? 0}
          min={0}
          max={10}
          step={0.5}
          onChange={(v) => onUpdate({ strokeWidth: v })}
        />
      </div>

      {/* Text shadow */}
      <div>
        <SectionLabel>Shadow</SectionLabel>
        <label className="flex items-center gap-2 cursor-pointer mb-1.5">
          <input
            type="checkbox"
            checked={el.shadowEnabled ?? false}
            onChange={(e) => onUpdate({ shadowEnabled: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-surface-600 bg-surface-900 accent-brand-500"
          />
          <span className="text-[11px] text-surface-300">Enable shadow</span>
        </label>
        {el.shadowEnabled && (
          <div className="flex flex-col gap-1.5 pl-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-surface-400 w-20 shrink-0">Color</span>
              <ColorPickerButton
                value={el.shadowColor ?? '#000000'}
                onChange={(c) => onUpdate({ shadowColor: c })}
              />
            </div>
            <SliderRow
              label="Blur"
              value={el.shadowBlur ?? 10}
              min={0}
              max={50}
              onChange={(v) => onUpdate({ shadowBlur: v })}
            />
            <SliderRow
              label="Offset X"
              value={el.shadowOffsetX ?? 2}
              min={-20}
              max={20}
              onChange={(v) => onUpdate({ shadowOffsetX: v })}
            />
            <SliderRow
              label="Offset Y"
              value={el.shadowOffsetY ?? 2}
              min={-20}
              max={20}
              onChange={(v) => onUpdate({ shadowOffsetY: v })}
            />
          </div>
        )}
      </div>

      {/* Opacity */}
      <SliderRow
        label="Opacity"
        value={el.opacity ?? 1}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => onUpdate({ opacity: v })}
      />

      {/* Rotation */}
      <NumberInput
        label="Rotation"
        value={el.rotation ?? 0}
        min={-360}
        max={360}
        onChange={(v) => onUpdate({ rotation: v })}
      />
    </div>
  )
}

function ShapeProperties({
  el,
  onUpdate,
}: {
  el: CanvasElement
  onUpdate: (updates: Partial<CanvasElement>) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Fill color */}
      <div>
        <SectionLabel>Fill Color</SectionLabel>
        <div className="flex items-center gap-2">
          <ColorPickerButton
            value={el.fill ?? '#5c7cfa'}
            onChange={(c) => onUpdate({ fill: c })}
          />
          <span className="text-[11px] text-surface-400 uppercase">
            {el.fill ?? '#5c7cfa'}
          </span>
        </div>
      </div>

      {/* Stroke */}
      <div>
        <SectionLabel>Stroke</SectionLabel>
        <div className="flex items-center gap-2 mb-1.5">
          <ColorPickerButton
            value={el.stroke ?? '#000000'}
            onChange={(c) => onUpdate({ stroke: c })}
          />
          <span className="text-[11px] text-surface-400 uppercase">
            {el.stroke ?? '#000000'}
          </span>
        </div>
        <SliderRow
          label="Width"
          value={el.strokeWidth ?? 0}
          min={0}
          max={10}
          step={0.5}
          onChange={(v) => onUpdate({ strokeWidth: v })}
        />
      </div>

      {/* Corner radius (rectangle only) */}
      {el.shapeType === 'rectangle' && (
        <SliderRow
          label="Radius"
          value={el.cornerRadius ?? 0}
          min={0}
          max={50}
          onChange={(v) => onUpdate({ cornerRadius: v })}
        />
      )}

      {/* Opacity */}
      <SliderRow
        label="Opacity"
        value={el.opacity ?? 1}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => onUpdate({ opacity: v })}
      />

      {/* Rotation */}
      <NumberInput
        label="Rotation"
        value={el.rotation ?? 0}
        min={-360}
        max={360}
        onChange={(v) => onUpdate({ rotation: v })}
      />
    </div>
  )
}

function ImageProperties({
  el,
  onUpdate,
}: {
  el: CanvasElement
  onUpdate: (updates: Partial<CanvasElement>) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Opacity */}
      <SliderRow
        label="Opacity"
        value={el.opacity ?? 1}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => onUpdate({ opacity: v })}
      />

      {/* Rotation */}
      <NumberInput
        label="Rotation"
        value={el.rotation ?? 0}
        min={-360}
        max={360}
        onChange={(v) => onUpdate({ rotation: v })}
      />
    </div>
  )
}

function ElementProperties({
  element,
  onUpdate,
  onShowPremium,
}: {
  element: CanvasElement
  onUpdate: (updates: Partial<CanvasElement>) => void
  onShowPremium: () => void
}) {
  return (
    <div className="p-3 overflow-y-auto flex-1 min-h-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-3">
        Properties
      </h3>

      {element.type === 'text' && (
        <TextProperties el={element} onUpdate={onUpdate} onShowPremium={onShowPremium} />
      )}
      {element.type === 'shape' && (
        <ShapeProperties el={element} onUpdate={onUpdate} />
      )}
      {element.type === 'image' && (
        <ImageProperties el={element} onUpdate={onUpdate} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layer Panel
// ---------------------------------------------------------------------------

function LayerRow({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  element: CanvasElement
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<CanvasElement>) => void
  onDelete: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(element.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const commitRename = () => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== element.name) {
      onUpdate({ name: trimmed })
    } else {
      setEditName(element.name)
    }
    setEditing(false)
  }

  const startEditing = () => {
    setEditName(element.name)
    setEditing(true)
    // Focus the input after render
    setTimeout(() => inputRef.current?.select(), 0)
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      onDoubleClick={(e) => {
        e.stopPropagation()
        startEditing()
      }}
      className={`group flex items-center gap-1 h-8 px-1.5 rounded cursor-pointer select-none transition-colors ${
        isSelected
          ? 'bg-brand-600/20 border border-brand-500/40'
          : 'border border-transparent hover:bg-surface-800/60'
      }`}
    >
      {/* Drag handle */}
      <span className="shrink-0 text-surface-600 cursor-grab active:cursor-grabbing">
        <GripVertical size={12} />
      </span>

      {/* Name */}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') {
              setEditName(element.name)
              setEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 h-5 bg-surface-900 border border-surface-600 rounded px-1 text-[11px] text-surface-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      ) : (
        <span className="flex-1 min-w-0 truncate text-[11px] text-surface-300">
          {element.name}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Visibility */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onUpdate({ visible: !element.visible })
          }}
          className="flex items-center justify-center h-5 w-5 rounded text-surface-500 hover:text-surface-200 transition-colors"
          title={element.visible ? 'Hide' : 'Show'}
        >
          {element.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>

        {/* Lock */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onUpdate({ locked: !element.locked })
          }}
          className="flex items-center justify-center h-5 w-5 rounded text-surface-500 hover:text-surface-200 transition-colors"
          title={element.locked ? 'Unlock' : 'Lock'}
        >
          {element.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex items-center justify-center h-5 w-5 rounded text-surface-500 hover:text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function LayerPanel({
  elements,
  selectedId,
  onSelect,
  onUpdateElement,
  onDeleteElement,
  onReorderElements,
}: {
  elements: CanvasElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void
  onDeleteElement: (id: string) => void
  onReorderElements: (fromIndex: number, toIndex: number) => void
}) {
  const dragIndexRef = useRef<number | null>(null)

  // Reverse so top layer appears first in the list
  const reversed = [...elements].reverse()

  const handleDragStart = useCallback(
    (displayIndex: number) => (e: React.DragEvent) => {
      dragIndexRef.current = displayIndex
      e.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const handleDragOver = useCallback(
    (_displayIndex: number) => (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    },
    []
  )

  const handleDrop = useCallback(
    (displayIndex: number) => (e: React.DragEvent) => {
      e.preventDefault()
      const fromDisplay = dragIndexRef.current
      if (fromDisplay === null || fromDisplay === displayIndex) return

      // Convert display indices (reversed) back to actual element indices
      const lastIdx = elements.length - 1
      const fromActual = lastIdx - fromDisplay
      const toActual = lastIdx - displayIndex

      onReorderElements(fromActual, toActual)
      dragIndexRef.current = null
    },
    [elements.length, onReorderElements]
  )

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-3 py-2 border-t border-surface-800">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
          Layers
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {reversed.length === 0 && (
          <p className="text-[11px] text-surface-600 text-center py-4">
            No layers yet
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {reversed.map((el, displayIdx) => (
            <LayerRow
              key={el.id}
              element={el}
              isSelected={el.id === selectedId}
              onSelect={() => onSelect(el.id)}
              onUpdate={(updates) => onUpdateElement(el.id, updates)}
              onDelete={() => onDeleteElement(el.id)}
              onDragStart={handleDragStart(displayIdx)}
              onDragOver={handleDragOver(displayIdx)}
              onDrop={handleDrop(displayIdx)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RightSidebar({
  elements,
  selectedElement,
  selectedId,
  onSelect,
  onUpdateElement,
  onDeleteElement,
  onReorderElements,
  onShowPremium,
}: RightSidebarProps) {
  return (
    <aside className="w-[250px] shrink-0 bg-surface-950 border-l border-surface-800 flex flex-col h-full overflow-hidden">
      {/* Top half: element properties */}
      {selectedElement ? (
        <ElementProperties
          element={selectedElement}
          onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
          onShowPremium={onShowPremium}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-[11px] text-surface-600 text-center">
            Select an element to edit its properties
          </p>
        </div>
      )}

      {/* Bottom half: layer panel */}
      <LayerPanel
        elements={elements}
        selectedId={selectedId}
        onSelect={onSelect}
        onUpdateElement={onUpdateElement}
        onDeleteElement={onDeleteElement}
        onReorderElements={onReorderElements}
      />
    </aside>
  )
}
