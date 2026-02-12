'use client'

import { useState } from 'react'
import { X, Download, Copy, Check, Image } from 'lucide-react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  remainingExports: number
  dailyLimit: number
  onExport: (format: 'png' | 'jpg', quality: number, addWatermark: boolean) => Promise<string | null>
  onDownload: (dataURL: string, filename: string) => void
  onCopy: (dataURL: string) => Promise<boolean>
  onLimitReached: () => void
}

export default function ExportModal({
  isOpen,
  onClose,
  remainingExports,
  dailyLimit,
  onExport,
  onDownload,
  onCopy,
  onLimitReached,
}: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'jpg'>('png')
  const [quality, setQuality] = useState(0.92)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewURL, setPreviewURL] = useState<string | null>(null)

  if (!isOpen) return null

  const handleExport = async () => {
    if (remainingExports <= 0) {
      onLimitReached()
      return
    }
    setIsExporting(true)
    const dataURL = await onExport(format, quality, true)
    if (dataURL) {
      setPreviewURL(dataURL)
    }
    setIsExporting(false)
  }

  const handleDownload = () => {
    if (!previewURL) return
    const ext = format === 'png' ? 'png' : 'jpg'
    onDownload(previewURL, `thumbcraft-export.${ext}`)
  }

  const handleCopy = async () => {
    if (!previewURL) return
    const success = await onCopy(previewURL)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setPreviewURL(null)
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md mx-4 bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <div className="flex items-center gap-2">
            <Image size={20} className="text-brand-400" />
            <h2 className="text-lg font-semibold text-white">Export Image</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-surface-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Format selector */}
          <div>
            <label className="text-sm font-medium text-surface-300 block mb-2">Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('png')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  format === 'png'
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setFormat('jpg')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  format === 'jpg'
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                }`}
              >
                JPG
              </button>
            </div>
          </div>

          {/* Quality slider (JPG only) */}
          {format === 'jpg' && (
            <div>
              <label className="text-sm font-medium text-surface-300 block mb-2">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          )}

          {/* Remaining exports */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-400">Exports remaining today</span>
            <span className={`font-semibold ${remainingExports <= 1 ? 'text-red-400' : 'text-surface-200'}`}>
              {remainingExports} / {dailyLimit}
            </span>
          </div>

          {/* Watermark notice */}
          <div className="bg-surface-900 rounded-lg px-4 py-3 text-xs text-surface-400">
            Free exports include a small &ldquo;Made with ThumbCraft&rdquo; watermark.
            <a href="#upgrade" className="text-brand-400 hover:text-brand-300 ml-1">
              Upgrade to Pro
            </a>{' '}
            for watermark-free exports.
          </div>

          {/* Preview */}
          {previewURL && (
            <div className="border border-surface-800 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewURL} alt="Export preview" className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!previewURL ? (
              <button
                onClick={handleExport}
                disabled={isExporting || remainingExports <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {isExporting ? (
                  <span className="animate-pulse">Generating...</span>
                ) : (
                  <>
                    <Download size={18} />
                    Generate Export
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-800 hover:bg-surface-700 text-white rounded-xl transition-colors"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
