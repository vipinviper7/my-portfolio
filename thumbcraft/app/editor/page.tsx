'use client'

import { useCallback, useEffect, useState } from 'react'
import { useCanvas, CanvasElement, CanvasBackground } from '@/hooks/useCanvas'
import { useExport } from '@/hooks/useExport'
import Canvas from '@/components/editor/Canvas'
import LeftSidebar from '@/components/editor/LeftSidebar'
import RightSidebar from '@/components/editor/RightSidebar'
import Toolbar from '@/components/editor/Toolbar'
import ExportModal from '@/components/shared/ExportModal'
import PremiumModal from '@/components/shared/PremiumModal'
import type { Template } from '@/lib/templates'

export default function EditorPage() {
  const {
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
  } = useCanvas()

  const {
    canExport,
    getRemainingExports,
    exportCanvas,
    downloadDataURL,
    copyToClipboard,
    DAILY_LIMIT,
  } = useExport()

  const [showExport, setShowExport] = useState(false)
  const [showPremium, setShowPremium] = useState(false)
  const [premiumFeature, setPremiumFeature] = useState<string | undefined>()

  const handleShowPremium = useCallback((feature?: string) => {
    setPremiumFeature(feature)
    setShowPremium(true)
  }, [])

  const handleLoadTemplate = useCallback(
    (template: Template) => {
      if (template.isPremium) {
        handleShowPremium('Premium templates')
        return
      }
      loadTemplate({
        width: template.width,
        height: template.height,
        background: template.background as CanvasBackground,
        elements: template.elements,
      })
    },
    [loadTemplate, handleShowPremium]
  )

  const handleExportClick = useCallback(() => {
    if (!canExport()) {
      handleShowPremium('Unlimited exports')
      return
    }
    setShowExport(true)
  }, [canExport, handleShowPremium])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        deleteElement(selectedId)
      }

      // Ctrl+Z / Ctrl+Shift+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }

      // Ctrl+D - duplicate
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedId) {
        e.preventDefault()
        duplicateElement(selectedId)
      }

      // Ctrl+C - copy
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        copyElement()
      }

      // Ctrl+V - paste
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        pasteElement()
      }

      // Arrow keys - nudge
      if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const amount = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -amount : e.key === 'ArrowRight' ? amount : 0
        const dy = e.key === 'ArrowUp' ? -amount : e.key === 'ArrowDown' ? amount : 0
        nudgeElement(selectedId, dx, dy)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, deleteElement, undo, redo, duplicateElement, copyElement, pasteElement, nudgeElement])

  return (
    <div className="h-screen flex flex-col bg-surface-950 overflow-hidden">
      {/* Google AdSense: Leaderboard 728x90 (free users only) */}
      <div className="w-full flex justify-center bg-surface-900 border-b border-surface-800">
        {/* <!-- Google AdSense: Leaderboard 728x90 --> */}
        <div className="ad-container max-w-[728px] w-full h-[90px]">
          Ad Space — 728×90
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        canvasWidth={state.width}
        canvasHeight={state.height}
        zoom={zoom}
        canUndo={canUndo}
        canRedo={canRedo}
        onZoomIn={() => setZoom(Math.min(zoom + 0.1, 3))}
        onZoomOut={() => setZoom(Math.max(zoom - 0.1, 0.1))}
        onZoomFit={() => setZoom(1)}
        onUndo={undo}
        onRedo={redo}
        onExport={handleExportClick}
        onClear={clearCanvas}
      />

      {/* Main editor layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <LeftSidebar
          canvasWidth={state.width}
          canvasHeight={state.height}
          background={state.background}
          onSetSize={setCanvasSize}
          onSetBackground={setBackground}
          onAddElement={addElement}
          onLoadTemplate={handleLoadTemplate}
          onShowPremium={() => handleShowPremium()}
        />

        {/* Canvas workspace */}
        <div className="flex-1 overflow-hidden bg-surface-900/50 relative">
          <Canvas
            state={state}
            selectedId={selectedId}
            zoom={zoom}
            stageRef={stageRef}
            onSelect={setSelectedId}
            onElementUpdate={updateElement}
          />

          {/* Empty state */}
          {state.elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-surface-500 text-lg mb-1">Canvas is empty</p>
                <p className="text-surface-600 text-sm">
                  Click a template or start adding elements from the left panel
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col w-[250px] border-l border-surface-800">
          <RightSidebar
            elements={state.elements}
            selectedElement={selectedElement}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onReorderElements={reorderElements}
            onShowPremium={() => handleShowPremium('Premium fonts')}
          />

          {/* Google AdSense: Rectangle 300x250 (free users only) */}
          <div className="p-2 border-t border-surface-800">
            {/* <!-- Google AdSense: Rectangle 300x250 --> */}
            <div className="ad-container w-full h-[250px] rounded-lg">
              Ad Space — 300×250
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        remainingExports={getRemainingExports()}
        dailyLimit={DAILY_LIMIT}
        onExport={(format, quality, addWatermark) =>
          exportCanvas(stageRef, format, quality, addWatermark)
        }
        onDownload={downloadDataURL}
        onCopy={copyToClipboard}
        onLimitReached={() => {
          setShowExport(false)
          handleShowPremium('Unlimited exports')
        }}
      />

      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        feature={premiumFeature}
      />
    </div>
  )
}
