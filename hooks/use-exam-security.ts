"use client"

import { useState, useEffect, useCallback } from "react"

export interface SecurityViolation {
  type: "tab_switch" | "fullscreen_exit" | "keyboard_shortcut" | "right_click" | "copy_paste"
  description: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface UseExamSecurityProps {
  onViolation: (violation: SecurityViolation) => void
}

export function useExamSecurity({ onViolation }: UseExamSecurityProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [violations, setViolations] = useState<SecurityViolation[]>([])

  const reportViolation = useCallback(
    (type: SecurityViolation["type"], description: string, severity: SecurityViolation["severity"] = "medium") => {
      const violation: SecurityViolation = {
        type,
        description,
        timestamp: new Date().toISOString(),
        severity,
      }

      setViolations((prev) => [...prev, violation])
      onViolation(violation)
    },
    [onViolation],
  )

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch (error) {
      console.error("Failed to enter fullscreen:", error)
      reportViolation("fullscreen_exit", "Failed to enter fullscreen mode", "high")
    }
  }, [reportViolation])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error("Failed to exit fullscreen:", error)
    }
  }, [])

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen && isFullscreen) {
        reportViolation("fullscreen_exit", "Student exited fullscreen mode", "high")
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [isFullscreen, reportViolation])

  // Monitor tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation("tab_switch", "Student switched to another tab or window", "high")
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [reportViolation])

  // Block keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Block F12 (Developer Tools)
      if (event.key === "F12") {
        event.preventDefault()
        reportViolation("keyboard_shortcut", "Attempted to open developer tools (F12)", "high")
        return
      }

      // Block Ctrl+Shift+I (Developer Tools)
      if (event.ctrlKey && event.shiftKey && event.key === "I") {
        event.preventDefault()
        reportViolation("keyboard_shortcut", "Attempted to open developer tools (Ctrl+Shift+I)", "high")
        return
      }

      // Block Ctrl+Shift+J (Console)
      if (event.ctrlKey && event.shiftKey && event.key === "J") {
        event.preventDefault()
        reportViolation("keyboard_shortcut", "Attempted to open console (Ctrl+Shift+J)", "high")
        return
      }

      // Block Ctrl+U (View Source)
      if (event.ctrlKey && event.key === "u") {
        event.preventDefault()
        reportViolation("keyboard_shortcut", "Attempted to view page source (Ctrl+U)", "medium")
        return
      }

      // Block Alt+Tab (Task Switcher)
      if (event.altKey && event.key === "Tab") {
        event.preventDefault()
        reportViolation("keyboard_shortcut", "Attempted to switch applications (Alt+Tab)", "high")
        return
      }

      // Block Ctrl+Alt+Del
      if (event.ctrlKey && event.altKey && event.key === "Delete") {
        event.preventDefault()
        reportViolation("keyboard_shortcut", "Attempted to access task manager (Ctrl+Alt+Del)", "high")
        return
      }

      // Block Windows key
      if (event.key === "Meta" || event.key === "OS") {
        event.preventDefault()
        reportViolation("keyboard_shortcut", "Attempted to access start menu (Windows key)", "medium")
        return
      }

      // Block Ctrl+C and Ctrl+V (Copy/Paste)
      if (event.ctrlKey && (event.key === "c" || event.key === "C")) {
        event.preventDefault()
        reportViolation("copy_paste", "Attempted to copy content (Ctrl+C)", "medium")
        return
      }

      if (event.ctrlKey && (event.key === "v" || event.key === "V")) {
        event.preventDefault()
        reportViolation("copy_paste", "Attempted to paste content (Ctrl+V)", "medium")
        return
      }

      // Block Ctrl+A (Select All)
      if (event.ctrlKey && (event.key === "a" || event.key === "A")) {
        // Allow select all within input fields
        const target = event.target as HTMLElement
        if (!target.matches("input, textarea")) {
          event.preventDefault()
          reportViolation("keyboard_shortcut", "Attempted to select all content (Ctrl+A)", "low")
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [reportViolation])

  // Block right-click context menu
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      reportViolation("right_click", "Attempted to open context menu (right-click)", "low")
    }

    document.addEventListener("contextmenu", handleContextMenu)
    return () => document.removeEventListener("contextmenu", handleContextMenu)
  }, [reportViolation])

  // Block text selection in certain areas
  useEffect(() => {
    const handleSelectStart = (event: Event) => {
      const target = event.target as HTMLElement
      // Allow text selection in input fields and textareas
      if (!target.matches("input, textarea")) {
        event.preventDefault()
      }
    }

    document.addEventListener("selectstart", handleSelectStart)
    return () => document.removeEventListener("selectstart", handleSelectStart)
  }, [])

  // Block drag and drop
  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      event.preventDefault()
      reportViolation("keyboard_shortcut", "Attempted to drag content", "low")
    }

    const handleDrop = (event: DragEvent) => {
      event.preventDefault()
      reportViolation("keyboard_shortcut", "Attempted to drop content", "low")
    }

    document.addEventListener("dragstart", handleDragStart)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragstart", handleDragStart)
      document.removeEventListener("drop", handleDrop)
    }
  }, [reportViolation])

  return {
    isFullscreen,
    violations,
    enterFullscreen,
    exitFullscreen,
    reportViolation,
  }
}
