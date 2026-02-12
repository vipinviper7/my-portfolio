'use client'

import { useCallback, useState } from 'react'
import Konva from 'konva'

const DAILY_LIMIT = 5
const STORAGE_KEY = 'thumbcraft_exports'

function getExportCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const today = new Date().toDateString()
    if (data.date !== today) return 0
    return data.count || 0
  } catch {
    return 0
  }
}

function incrementExportCount(): number {
  const today = new Date().toDateString()
  const data = { date: today, count: getExportCount() + 1 }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data.count
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)

  const canExport = useCallback(() => {
    return getExportCount() < DAILY_LIMIT
  }, [])

  const getRemainingExports = useCallback(() => {
    return Math.max(0, DAILY_LIMIT - getExportCount())
  }, [])

  const exportCanvas = useCallback(
    async (
      stageRef: React.RefObject<Konva.Stage>,
      format: 'png' | 'jpg' = 'png',
      quality: number = 1,
      addWatermark: boolean = true
    ) => {
      if (!stageRef.current) return null
      setIsExporting(true)

      try {
        const stage = stageRef.current
        const pixelRatio = 1
        const dataURL = stage.toDataURL({
          pixelRatio,
          mimeType: format === 'jpg' ? 'image/jpeg' : 'image/png',
          quality: format === 'jpg' ? quality : undefined,
        })

        if (addWatermark) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          return new Promise<string>((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')!
              ctx.drawImage(img, 0, 0)
              ctx.font = '14px sans-serif'
              ctx.fillStyle = 'rgba(255,255,255,0.5)'
              ctx.textAlign = 'right'
              ctx.fillText('Made with ThumbCraft', canvas.width - 16, canvas.height - 16)
              const result = canvas.toDataURL(
                format === 'jpg' ? 'image/jpeg' : 'image/png',
                format === 'jpg' ? quality : undefined
              )
              incrementExportCount()
              resolve(result)
            }
            img.src = dataURL
          })
        }

        incrementExportCount()
        return dataURL
      } finally {
        setIsExporting(false)
      }
    },
    []
  )

  const downloadDataURL = useCallback((dataURL: string, filename: string) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataURL
    link.click()
  }, [])

  const copyToClipboard = useCallback(async (dataURL: string) => {
    try {
      const res = await fetch(dataURL)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      return true
    } catch {
      return false
    }
  }, [])

  return {
    isExporting,
    canExport,
    getRemainingExports,
    exportCanvas,
    downloadDataURL,
    copyToClipboard,
    DAILY_LIMIT,
  }
}
