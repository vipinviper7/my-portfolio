'use client'

import Link from 'next/link'
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Trash2,
} from 'lucide-react'

interface ToolbarProps {
  canvasWidth: number
  canvasHeight: number
  zoom: number
  canUndo: boolean
  canRedo: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomFit: () => void
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  onClear: () => void
}

function IconButton({
  onClick,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-md text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200 disabled:cursor-not-allowed disabled:text-surface-700 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-1.5 h-6 w-px bg-surface-800" />
}

export default function Toolbar({
  canvasWidth,
  canvasHeight,
  zoom,
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onUndo,
  onRedo,
  onExport,
  onClear,
}: ToolbarProps) {
  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="flex h-[52px] items-center justify-between border-b border-surface-800 bg-surface-950 px-4">
      {/* Left section: Logo + canvas size */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-lg font-bold text-brand-500 transition-colors hover:text-brand-400"
        >
          ThumbCraft
        </Link>
        <span className="rounded bg-surface-900 px-2 py-0.5 text-xs tabular-nums text-surface-500">
          {canvasWidth} &times; {canvasHeight}
        </span>
      </div>

      {/* Center section: Undo/Redo + Zoom controls */}
      <div className="flex items-center gap-1">
        <IconButton onClick={onUndo} disabled={!canUndo} title="Undo">
          <Undo2 size={16} />
        </IconButton>
        <IconButton onClick={onRedo} disabled={!canRedo} title="Redo">
          <Redo2 size={16} />
        </IconButton>

        <Divider />

        <IconButton onClick={onZoomOut} title="Zoom out">
          <ZoomOut size={16} />
        </IconButton>
        <span className="w-12 text-center text-xs tabular-nums text-surface-400">
          {zoomPercent}%
        </span>
        <IconButton onClick={onZoomIn} title="Zoom in">
          <ZoomIn size={16} />
        </IconButton>
        <IconButton onClick={onZoomFit} title="Fit to screen">
          <Maximize size={16} />
        </IconButton>
      </div>

      {/* Right section: Export + Clear */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          title="Clear canvas"
          className="flex h-8 items-center gap-1.5 rounded-md px-3 text-sm text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
        >
          <Trash2 size={15} />
          <span>Clear</span>
        </button>
        <button
          onClick={onExport}
          title="Export thumbnail"
          className="flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <Download size={15} />
          <span>Export</span>
        </button>
      </div>
    </div>
  )
}
