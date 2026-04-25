import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcutActions {
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  repeat: () => void
  dismiss: () => void
  addTime: (seconds: number) => void
}

export interface KeyboardShortcutState {
  isRunning: boolean
  isPaused: boolean
  totalSeconds: number
  timerFinishedWhileInactive: boolean
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions, getState: () => KeyboardShortcutState) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    const { isRunning, isPaused, totalSeconds, timerFinishedWhileInactive } = getState()

    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      if (!isRunning && totalSeconds > 0) {
        actions.start()
      } else if (isRunning && !isPaused) {
        actions.pause()
      } else if (isPaused) {
        actions.resume()
      }
      return
    }

    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault()
      if (timerFinishedWhileInactive) {
        actions.repeat()
      } else {
        actions.reset()
      }
      return
    }

    if (timerFinishedWhileInactive && (e.key === 'd' || e.key === 'D' || e.code === 'KeyD')) {
      e.preventDefault()
      e.stopPropagation()
      actions.dismiss()
      return
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      if (isRunning) {
        return
      }
      switch (e.key) {
        case 'ArrowUp':
          actions.addTime(1)
          break
        case 'ArrowDown':
          actions.addTime(-1)
          break
        case 'ArrowRight':
          actions.addTime(60)
          break
        case 'ArrowLeft':
          actions.addTime(-60)
          break
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
