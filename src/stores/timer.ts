import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TimerState {
  tabId: string
  hours: number
  minutes: number
  seconds: number
  isRunning: boolean
  isPaused: boolean
  remainingSeconds: number
  initialSeconds: number
  startTime: number | null // Timestamp when timer started
  pausedAt: number | null // Timestamp when paused
  pausedRemaining: number | null // Remaining seconds when paused
  timerFinishedWhileInactive?: boolean // Flag to indicate timer finished while tab was inactive
  label?: string // Label for the timer
}

const STORAGE_KEY = 'timer-state'
const TAB_ID_KEY = 'timer-tab-id'

// Generate a unique tab ID
const getTabId = (): string => {
  let tabId = sessionStorage.getItem(TAB_ID_KEY)
  if (!tabId) {
    tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(TAB_ID_KEY, tabId)
  }
  return tabId
}

export const useTimerStore = defineStore('timer', () => {
  const tabId = ref(getTabId())
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const isRunning = ref(false)
  const isPaused = ref(false)
  const remainingSeconds = ref(0)
  const initialSeconds = ref(0)
  const startTime = ref<number | null>(null)
  const pausedAt = ref<number | null>(null)
  const pausedRemaining = ref<number | null>(null)
  const timerFinishedWhileInactive = ref(false)
  const label = ref<string>('')

  // BroadcastChannel for cross-tab communication (optional, for future features)
  let broadcastChannel: BroadcastChannel | null = null
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('timer-sync')
    broadcastChannel.onmessage = (event) => {
      // Handle cross-tab messages if needed in the future
      // For now, we keep tabs independent
    }
  }

  // Save current state to localStorage
  const saveState = () => {
    const state: TimerState = {
      tabId: tabId.value,
      hours: hours.value,
      minutes: minutes.value,
      seconds: seconds.value,
      isRunning: isRunning.value,
      isPaused: isPaused.value,
      remainingSeconds: remainingSeconds.value,
      initialSeconds: initialSeconds.value,
      startTime: startTime.value,
      pausedAt: pausedAt.value,
      pausedRemaining: pausedRemaining.value,
      timerFinishedWhileInactive: timerFinishedWhileInactive.value,
      label: label.value || undefined,
    }
    localStorage.setItem(`${STORAGE_KEY}-${tabId.value}`, JSON.stringify(state))
  }

  // Load state from localStorage
  const loadState = (): boolean => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-${tabId.value}`)
    if (!saved) return false

    try {
      const state: TimerState = JSON.parse(saved)
      
      // Restore basic state
      hours.value = state.hours || 0
      minutes.value = state.minutes || 0
      seconds.value = state.seconds || 0
      initialSeconds.value = state.initialSeconds || 0
      isPaused.value = state.isPaused || false
      startTime.value = state.startTime
      pausedAt.value = state.pausedAt
      pausedRemaining.value = state.pausedRemaining
      timerFinishedWhileInactive.value = state.timerFinishedWhileInactive || false
      label.value = state.label || ''

      // If timer was running, calculate remaining time based on elapsed time
      if (state.isRunning && !state.isPaused && state.startTime) {
        const now = Date.now()
        const elapsed = Math.floor((now - state.startTime) / 1000)
        const calculatedRemaining = state.initialSeconds - elapsed
        
        if (calculatedRemaining > 0) {
          remainingSeconds.value = calculatedRemaining
          isRunning.value = true
          timerFinishedWhileInactive.value = false
          return true // Timer should continue running
        } else {
          // Timer expired while page was closed
          remainingSeconds.value = 0
          isRunning.value = false
          isPaused.value = false
          timerFinishedWhileInactive.value = true
          saveState() // Save the state with the flag set
          return false
        }
      } else if (state.isPaused && state.pausedRemaining !== null) {
        // Timer was paused
        remainingSeconds.value = state.pausedRemaining
        isRunning.value = false
        isPaused.value = true
        return false
      } else {
        // Timer was stopped
        remainingSeconds.value = state.remainingSeconds || 0
        isRunning.value = false
        isPaused.value = false
        return false
      }
    } catch (e) {
      console.error('Failed to load timer state', e)
      return false
    }
  }

  // Clear state for this tab
  const clearState = () => {
    localStorage.removeItem(`${STORAGE_KEY}-${tabId.value}`)
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    isRunning.value = false
    isPaused.value = false
    remainingSeconds.value = 0
    initialSeconds.value = 0
    startTime.value = null
    pausedAt.value = null
    pausedRemaining.value = null
    timerFinishedWhileInactive.value = false
    label.value = ''
  }

  // Clear the finished indicator
  const clearFinishedIndicator = () => {
    timerFinishedWhileInactive.value = false
    saveState()
  }

  // Update time display from remaining seconds
  const updateTimeFromRemaining = () => {
    const total = remainingSeconds.value
    hours.value = Math.floor(total / 3600)
    const remaining = total % 3600
    minutes.value = Math.floor(remaining / 60)
    seconds.value = remaining % 60
  }

  // Start timer
  const start = () => {
    const total = hours.value * 3600 + minutes.value * 60 + seconds.value
    if (total === 0) return

    initialSeconds.value = total
    remainingSeconds.value = total
    isRunning.value = true
    isPaused.value = false
    startTime.value = Date.now()
    pausedAt.value = null
    pausedRemaining.value = null
    timerFinishedWhileInactive.value = false
    saveState()
  }

  // Pause timer
  const pause = () => {
    if (!isRunning.value) return
    
    isPaused.value = true
    isRunning.value = false
    pausedAt.value = Date.now()
    pausedRemaining.value = remainingSeconds.value
    startTime.value = null
    saveState()
  }

  // Resume timer
  const resume = () => {
    if (!isPaused.value || pausedRemaining.value === null) return

    isPaused.value = false
    isRunning.value = true
    remainingSeconds.value = pausedRemaining.value
    // Calculate startTime so that elapsed time matches the paused duration
    const elapsed = initialSeconds.value - pausedRemaining.value
    startTime.value = Date.now() - elapsed * 1000
    pausedAt.value = null
    pausedRemaining.value = null
    saveState()
  }

  // Stop timer
  const stop = () => {
    isRunning.value = false
    isPaused.value = false
    startTime.value = null
    pausedAt.value = null
    pausedRemaining.value = null
    timerFinishedWhileInactive.value = false
    saveState()
  }

  // Reset timer
  const reset = () => {
    stop()
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    remainingSeconds.value = 0
    initialSeconds.value = 0
    label.value = ''
    saveState()
  }

  // Set label
  const setLabel = (newLabel: string) => {
    label.value = newLabel.trim()
    saveState()
  }

  // Update remaining seconds (called by interval)
  const tick = () => {
    if (isRunning.value && !isPaused.value && startTime.value) {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime.value) / 1000)
      const calculatedRemaining = initialSeconds.value - elapsed
      
      if (calculatedRemaining > 0) {
        remainingSeconds.value = calculatedRemaining
        updateTimeFromRemaining()
        // Save state every 5 seconds to avoid too frequent writes
        if (elapsed % 5 === 0) {
          saveState()
        }
      } else {
        // Timer finished
        remainingSeconds.value = 0
        stop()
        // Always set the flag when timer finishes
        timerFinishedWhileInactive.value = true
        saveState()
        updateTimeFromRemaining()
        return true // Signal that timer finished
      }
    }
    return false
  }

  // Set time values
  const setTime = (h: number, m: number, s: number) => {
    hours.value = h
    minutes.value = m
    seconds.value = s
    // Clear finished indicator when time is changed (only if not running)
    if (!isRunning.value) {
      timerFinishedWhileInactive.value = false
    }
    saveState()
  }

  // Add time
  const addTime = (additionalSeconds: number) => {
    if (isRunning.value && !isPaused.value) {
      // Adjust remaining time
      remainingSeconds.value = Math.max(0, remainingSeconds.value + additionalSeconds)
      // Extend initial seconds by the same amount (to extend duration)
      initialSeconds.value = initialSeconds.value + additionalSeconds
      // startTime stays the same - we're extending the duration
      updateTimeFromRemaining()
    } else {
      const total = hours.value * 3600 + minutes.value * 60 + seconds.value + additionalSeconds
      if (total < 0) {
        hours.value = 0
        minutes.value = 0
        seconds.value = 0
      } else {
        hours.value = Math.floor(total / 3600)
        const remaining = total % 3600
        minutes.value = Math.floor(remaining / 60)
        seconds.value = remaining % 60
      }
      // Clear finished indicator when time is changed (only if not running)
      timerFinishedWhileInactive.value = false
    }
    saveState()
  }

  // Load state on initialization
  const shouldResume = loadState()
  if (shouldResume) {
    updateTimeFromRemaining()
  }

  return {
    // State
    tabId,
    hours,
    minutes,
    seconds,
    isRunning,
    isPaused,
    remainingSeconds,
    initialSeconds,
    startTime,
    pausedAt,
    pausedRemaining,
    timerFinishedWhileInactive,
    label,
    
    // Methods
    start,
    pause,
    resume,
    stop,
    reset,
    tick,
    setTime,
    addTime,
    setLabel,
    saveState,
    loadState,
    clearState,
    clearFinishedIndicator,
    updateTimeFromRemaining,
  }
})

