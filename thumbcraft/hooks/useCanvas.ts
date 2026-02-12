'use client'

import { useState, useCallback, useRef } from 'react'
import Konva from 'konva'
import { useHistory } from './useHistory'

export interface CanvasElement {
  id: string
  type: 'text' | 'shape' | 'image'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  name: string

  // Text properties
  text?: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: string
  textDecoration?: string
  fill?: string
  align?: string
  letterSpacing?: number
  lineHeight?: number
  stroke?: string
  strokeWidth?: number
  shadowEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number

  // Shape properties
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow'
  cornerRadius?: number

  // Image properties
  src?: string
  cropShape?: 'none' | 'circle' | 'rounded'
}

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'image'
  color?: string
  gradient?: { colors: [string, string]; angle: number }
  imageSrc?: string
  imageFit?: 'fill' | 'fit' | 'stretch'
}

export interface CanvasState {
  width: number
  height: number
  background: CanvasBackground
  elements: CanvasElement[]
}

let elementCounter = 0
function generateId() {
  return `el_${Date.now()}_${++elementCounter}`
}

const defaultState: CanvasState = {
  width: 1280,
  height: 720,
  background: { type: 'solid', color: '#1a1a2e' },
  elements: [],
}

export function useCanvas() {
  const { current: state, push, undo, redo, canUndo, canRedo } = useHistory<CanvasState>(defaultState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [clipboard, setClipboard] = useState<CanvasElement | null>(null)
  const stageRef = useRef<Konva.Stage>(null)

  const updateState = useCallback(
    (updater: (prev: CanvasState) => CanvasState) => {
      push(updater(state))
    },
    [state, push]
  )

  const setCanvasSize = useCallback(
    (width: number, height: number) => {
      updateState((s) => ({ ...s, width, height }))
    },
    [updateState]
  )

  const setBackground = useCallback(
    (background: CanvasBackground) => {
      updateState((s) => ({ ...s, background }))
    },
    [updateState]
  )

  const addElement = useCallback(
    (element: Omit<CanvasElement, 'id'>) => {
      const id = generateId()
      updateState((s) => ({
        ...s,
        elements: [...s.elements, { ...element, id }],
      }))
      setSelectedId(id)
      return id
    },
    [updateState]
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      updateState((s) => ({
        ...s,
        elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      }))
    },
    [updateState]
  )

  const deleteElement = useCallback(
    (id: string) => {
      updateState((s) => ({
        ...s,
        elements: s.elements.filter((el) => el.id !== id),
      }))
      if (selectedId === id) setSelectedId(null)
    },
    [updateState, selectedId]
  )

  const duplicateElement = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id)
      if (!el) return
      const newId = generateId()
      const newEl = { ...el, id: newId, x: el.x + 20, y: el.y + 20, name: `${el.name} copy` }
      updateState((s) => ({
        ...s,
        elements: [...s.elements, newEl],
      }))
      setSelectedId(newId)
    },
    [state, updateState]
  )

  const reorderElements = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateState((s) => {
        const newElements = [...s.elements]
        const [moved] = newElements.splice(fromIndex, 1)
        newElements.splice(toIndex, 0, moved)
        return { ...s, elements: newElements }
      })
    },
    [updateState]
  )

  const copyElement = useCallback(() => {
    if (!selectedId) return
    const el = state.elements.find((e) => e.id === selectedId)
    if (el) setClipboard(el)
  }, [selectedId, state])

  const pasteElement = useCallback(() => {
    if (!clipboard) return
    const newId = generateId()
    const newEl = { ...clipboard, id: newId, x: clipboard.x + 30, y: clipboard.y + 30, name: `${clipboard.name} copy` }
    updateState((s) => ({
      ...s,
      elements: [...s.elements, newEl],
    }))
    setSelectedId(newId)
  }, [clipboard, updateState])

  const nudgeElement = useCallback(
    (id: string, dx: number, dy: number) => {
      updateState((s) => ({
        ...s,
        elements: s.elements.map((el) =>
          el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
        ),
      }))
    },
    [updateState]
  )

  const loadTemplate = useCallback(
    (template: {
      width: number
      height: number
      background: CanvasBackground
      elements: Omit<CanvasElement, 'id'>[]
    }) => {
      const elements = template.elements.map((el) => ({ ...el, id: generateId() }))
      push({
        width: template.width,
        height: template.height,
        background: template.background,
        elements,
      })
      setSelectedId(null)
    },
    [push]
  )

  const clearCanvas = useCallback(() => {
    push({ ...state, elements: [] })
    setSelectedId(null)
  }, [push, state])

  const selectedElement = state.elements.find((e) => e.id === selectedId) || null

  return {
    state,
    selectedId,
    selectedElement,
    zoom,
    stageRef,
    canUndo,
    canRedo,
    setSelectedId,
    setZoom,
    setCanvasSize,
    setBackground,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    reorderElements,
    copyElement,
    pasteElement,
    nudgeElement,
    loadTemplate,
    clearCanvas,
    undo,
    redo,
  }
}
