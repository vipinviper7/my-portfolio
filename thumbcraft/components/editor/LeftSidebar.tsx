'use client'

import { useState, useRef } from 'react'
import {
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  ArrowRight,
  Image,
  Palette,
  Layout,
  Lock,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react'
import { SIZE_PRESETS } from '@/lib/sizes'
import { TEMPLATES, Template } from '@/lib/templates'
import { SOLID_COLORS, GRADIENT_PRESETS } from '@/lib/colors'
import type { CanvasElement, CanvasBackground } from '@/hooks/useCanvas'

interface LeftSidebarProps {
  canvasWidth: number
  canvasHeight: number
  background: CanvasBackground
  onSetSize: (width: number, height: number) => void
  onSetBackground: (bg: CanvasBackground) => void
  onAddElement: (element: Omit<CanvasElement, 'id'>) => void
  onLoadTemplate: (template: Template) => void
  onShowPremium: () => void
}

type BackgroundTab = 'solid' | 'gradient' | 'image'

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({ title, icon, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-surface-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-surface-200 transition-colors hover:bg-surface-900"
      >
        <span className="text-surface-400">{icon}</span>
        <span className="flex-1">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-surface-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-surface-500" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function LeftSidebar({
  canvasWidth,
  canvasHeight,
  background,
  onSetSize,
  onSetBackground,
  onAddElement,
  onLoadTemplate,
  onShowPremium,
}: LeftSidebarProps) {
  const [bgTab, setBgTab] = useState<BackgroundTab>('solid')
  const [customColor, setCustomColor] = useState('#5c7cfa')
  const [gradientColor1, setGradientColor1] = useState('#667eea')
  const [gradientColor2, setGradientColor2] = useState('#764ba2')
  const [gradientAngle, setGradientAngle] = useState(135)
  const [imageFit, setImageFit] = useState<'fill' | 'fit' | 'stretch'>('fill')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function getTemplatePreviewColor(template: Template): string {
    if (template.background.type === 'solid' && template.background.color) {
      return template.background.color
    }
    if (template.background.type === 'gradient' && template.background.gradient) {
      return template.background.gradient.colors[0]
    }
    return '#1a1a2e'
  }

  function getTemplatePreviewGradient(template: Template): string | null {
    if (template.background.type === 'gradient' && template.background.gradient) {
      const { colors, angle } = template.background.gradient
      return `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`
    }
    return null
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      onSetBackground({
        type: 'image',
        imageSrc: src,
        imageFit: imageFit,
      })
    }
    reader.readAsDataURL(file)
  }

  function addTextElement(variant: 'heading' | 'subheading' | 'body') {
    const configs = {
      heading: {
        text: 'Heading',
        fontSize: 48,
        fontFamily: 'Montserrat',
        fontStyle: 'bold',
        name: 'Heading',
        width: 500,
        height: 60,
      },
      subheading: {
        text: 'Subheading',
        fontSize: 28,
        fontFamily: 'Poppins',
        fontStyle: '',
        name: 'Subheading',
        width: 400,
        height: 40,
      },
      body: {
        text: 'Body text goes here',
        fontSize: 18,
        fontFamily: 'Lato',
        fontStyle: '',
        name: 'Body Text',
        width: 350,
        height: 30,
      },
    }

    const config = configs[variant]
    onAddElement({
      type: 'text',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width: config.width,
      height: config.height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      name: config.name,
      text: config.text,
      fontSize: config.fontSize,
      fontFamily: config.fontFamily,
      fontStyle: config.fontStyle,
      textDecoration: '',
      fill: '#ffffff',
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.4,
      stroke: '',
      strokeWidth: 0,
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    })
  }

  function addShapeElement(shapeType: CanvasElement['shapeType']) {
    const shapeConfigs: Record<
      NonNullable<CanvasElement['shapeType']>,
      { width: number; height: number; name: string }
    > = {
      rectangle: { width: 200, height: 150, name: 'Rectangle' },
      circle: { width: 150, height: 150, name: 'Circle' },
      triangle: { width: 180, height: 160, name: 'Triangle' },
      star: { width: 160, height: 160, name: 'Star' },
      line: { width: 200, height: 4, name: 'Line' },
      arrow: { width: 200, height: 4, name: 'Arrow' },
    }

    const config = shapeConfigs[shapeType!]
    onAddElement({
      type: 'shape',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      width: config.width,
      height: config.height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      name: config.name,
      shapeType: shapeType,
      fill: '#5c7cfa',
      stroke: '',
      strokeWidth: 0,
      cornerRadius: 0,
    })
  }

  return (
    <div className="flex h-full w-[280px] min-w-[280px] flex-col border-r border-surface-800 bg-surface-950">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-surface-800 px-4 py-3">
        <Layout className="h-4 w-4 text-brand-500" />
        <span className="text-sm font-semibold text-surface-200">Tools</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* ─── Size Presets ─── */}
        <CollapsibleSection title="Size Presets" icon={<Layout className="h-4 w-4" />} defaultOpen>
          <div className="grid grid-cols-2 gap-2">
            {SIZE_PRESETS.map((preset) => {
              const isActive = canvasWidth === preset.width && canvasHeight === preset.height
              return (
                <button
                  key={preset.name}
                  onClick={() => onSetSize(preset.width, preset.height)}
                  className={`rounded-lg border px-2 py-2 text-left transition-all ${
                    isActive
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-surface-700 bg-surface-900 text-surface-300 hover:border-surface-600 hover:bg-surface-800'
                  }`}
                >
                  <div className="truncate text-xs font-medium">{preset.name}</div>
                  <div className="mt-0.5 text-[10px] text-surface-500">
                    {preset.width} x {preset.height}
                  </div>
                </button>
              )
            })}
          </div>
        </CollapsibleSection>

        {/* ─── Templates ─── */}
        <CollapsibleSection title="Templates" icon={<Layout className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((template) => {
              const gradient = getTemplatePreviewGradient(template)
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    if (template.isPremium) {
                      onShowPremium()
                    } else {
                      onLoadTemplate(template)
                    }
                  }}
                  className="group relative overflow-hidden rounded-lg border border-surface-700 bg-surface-900 text-left transition-all hover:border-surface-600 hover:bg-surface-800"
                >
                  {/* Preview strip */}
                  <div
                    className="h-16 w-full"
                    style={
                      gradient
                        ? { background: gradient }
                        : { backgroundColor: getTemplatePreviewColor(template) }
                    }
                  />
                  {/* Info */}
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <span className="flex-1 truncate text-xs font-medium text-surface-200">
                        {template.name}
                      </span>
                      {template.isPremium && <Lock className="h-3 w-3 flex-shrink-0 text-brand-400" />}
                    </div>
                    <div className="text-[10px] text-surface-500">{template.category}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </CollapsibleSection>

        {/* ─── Background ─── */}
        <CollapsibleSection title="Background" icon={<Palette className="h-4 w-4" />} defaultOpen>
          {/* Sub-tabs */}
          <div className="mb-3 flex rounded-lg border border-surface-700 bg-surface-900 p-0.5">
            {(['solid', 'gradient', 'image'] as BackgroundTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setBgTab(tab)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                  bgTab === tab
                    ? 'bg-brand-500 text-white'
                    : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {tab === 'image' ? 'Image' : tab === 'solid' ? 'Solid' : 'Gradient'}
              </button>
            ))}
          </div>

          {/* Solid Color */}
          {bgTab === 'solid' && (
            <div>
              <div className="grid grid-cols-7 gap-1.5">
                {SOLID_COLORS.map((color, i) => {
                  const isActive = background.type === 'solid' && background.color === color
                  return (
                    <button
                      key={`${color}-${i}`}
                      onClick={() => onSetBackground({ type: 'solid', color })}
                      className={`h-7 w-7 rounded-md border-2 transition-all hover:scale-110 ${
                        isActive ? 'border-brand-400 ring-1 ring-brand-400' : 'border-surface-700'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  )
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-surface-400">Custom:</label>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded border border-surface-700 bg-transparent"
                />
                <button
                  onClick={() => onSetBackground({ type: 'solid', color: customColor })}
                  className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-500"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Gradient */}
          {bgTab === 'gradient' && (
            <div>
              <div className="grid grid-cols-4 gap-1.5">
                {GRADIENT_PRESETS.map((preset) => {
                  const isActive =
                    background.type === 'gradient' &&
                    background.gradient?.colors[0] === preset.colors[0] &&
                    background.gradient?.colors[1] === preset.colors[1]
                  return (
                    <button
                      key={preset.name}
                      onClick={() =>
                        onSetBackground({
                          type: 'gradient',
                          gradient: { colors: preset.colors, angle: preset.angle },
                        })
                      }
                      className={`h-10 rounded-md border-2 transition-all hover:scale-105 ${
                        isActive ? 'border-brand-400 ring-1 ring-brand-400' : 'border-surface-700'
                      }`}
                      style={{
                        background: `linear-gradient(${preset.angle}deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                      }}
                      title={preset.name}
                    />
                  )
                })}
              </div>

              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-surface-400">Custom Gradient</div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradientColor1}
                    onChange={(e) => setGradientColor1(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded border border-surface-700 bg-transparent"
                  />
                  <div
                    className="h-5 flex-1 rounded"
                    style={{
                      background: `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`,
                    }}
                  />
                  <input
                    type="color"
                    value={gradientColor2}
                    onChange={(e) => setGradientColor2(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded border border-surface-700 bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-surface-400">Angle:</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(Number(e.target.value))}
                    className="flex-1 accent-brand-500"
                  />
                  <span className="w-8 text-right text-xs text-surface-400">{gradientAngle}°</span>
                </div>
                <button
                  onClick={() =>
                    onSetBackground({
                      type: 'gradient',
                      gradient: {
                        colors: [gradientColor1, gradientColor2],
                        angle: gradientAngle,
                      },
                    })
                  }
                  className="w-full rounded-md bg-brand-600 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-500"
                >
                  Apply Gradient
                </button>
              </div>
            </div>
          )}

          {/* Image Upload */}
          {bgTab === 'image' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-surface-700 bg-surface-900 px-4 py-6 text-sm text-surface-400 transition-colors hover:border-surface-500 hover:text-surface-300"
              >
                <Image className="h-5 w-5" />
                <span>Upload Image</span>
              </button>

              <div>
                <div className="mb-1.5 text-xs font-medium text-surface-400">Image Fit</div>
                <div className="flex rounded-lg border border-surface-700 bg-surface-900 p-0.5">
                  {(['fill', 'fit', 'stretch'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setImageFit(mode)
                        if (background.type === 'image' && background.imageSrc) {
                          onSetBackground({
                            ...background,
                            imageFit: mode,
                          })
                        }
                      }}
                      className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                        imageFit === mode
                          ? 'bg-brand-500 text-white'
                          : 'text-surface-400 hover:text-surface-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection>

        {/* ─── Text Tool ─── */}
        <CollapsibleSection title="Text" icon={<Type className="h-4 w-4" />}>
          <div className="space-y-2">
            <button
              onClick={() => addTextElement('heading')}
              className="flex w-full items-center gap-3 rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-left transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Plus className="h-4 w-4 text-brand-400" />
              <div>
                <div className="text-sm font-bold text-surface-200" style={{ fontFamily: 'Montserrat' }}>
                  Heading
                </div>
                <div className="text-[10px] text-surface-500">48px Montserrat Bold</div>
              </div>
            </button>

            <button
              onClick={() => addTextElement('subheading')}
              className="flex w-full items-center gap-3 rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-left transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Plus className="h-4 w-4 text-brand-400" />
              <div>
                <div className="text-sm font-medium text-surface-200" style={{ fontFamily: 'Poppins' }}>
                  Subheading
                </div>
                <div className="text-[10px] text-surface-500">28px Poppins</div>
              </div>
            </button>

            <button
              onClick={() => addTextElement('body')}
              className="flex w-full items-center gap-3 rounded-lg border border-surface-700 bg-surface-900 px-3 py-2.5 text-left transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Plus className="h-4 w-4 text-brand-400" />
              <div>
                <div className="text-sm text-surface-200" style={{ fontFamily: 'Lato' }}>
                  Body text
                </div>
                <div className="text-[10px] text-surface-500">18px Lato</div>
              </div>
            </button>
          </div>
        </CollapsibleSection>

        {/* ─── Shape Tool ─── */}
        <CollapsibleSection title="Shapes" icon={<Square className="h-4 w-4" />}>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addShapeElement('rectangle')}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-700 bg-surface-900 px-2 py-3 transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Square className="h-6 w-6 text-brand-400" />
              <span className="text-[10px] text-surface-400">Rectangle</span>
            </button>

            <button
              onClick={() => addShapeElement('circle')}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-700 bg-surface-900 px-2 py-3 transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Circle className="h-6 w-6 text-brand-400" />
              <span className="text-[10px] text-surface-400">Circle</span>
            </button>

            <button
              onClick={() => addShapeElement('triangle')}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-700 bg-surface-900 px-2 py-3 transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Triangle className="h-6 w-6 text-brand-400" />
              <span className="text-[10px] text-surface-400">Triangle</span>
            </button>

            <button
              onClick={() => addShapeElement('star')}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-700 bg-surface-900 px-2 py-3 transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Star className="h-6 w-6 text-brand-400" />
              <span className="text-[10px] text-surface-400">Star</span>
            </button>

            <button
              onClick={() => addShapeElement('line')}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-700 bg-surface-900 px-2 py-3 transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <Minus className="h-6 w-6 text-brand-400" />
              <span className="text-[10px] text-surface-400">Line</span>
            </button>

            <button
              onClick={() => addShapeElement('arrow')}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-700 bg-surface-900 px-2 py-3 transition-colors hover:border-surface-600 hover:bg-surface-800"
            >
              <ArrowRight className="h-6 w-6 text-brand-400" />
              <span className="text-[10px] text-surface-400">Arrow</span>
            </button>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  )
}
