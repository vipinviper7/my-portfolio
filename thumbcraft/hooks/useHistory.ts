'use client'

import { useState, useCallback } from 'react'

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)

  const current = history[currentIndex]

  const push = useCallback((state: T) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(state)
      if (newHistory.length > 50) newHistory.shift()
      return newHistory
    })
    setCurrentIndex((prev) => Math.min(prev + 1, 49))
  }, [currentIndex])

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, history.length - 1))
  }, [history.length])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return { current, push, undo, redo, canUndo, canRedo }
}
