import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorageItem, setStorageItem } from '../utils/safeStorage'
import {
  MAX_HOURS,
  MAX_MINUTES,
  MAX_SECONDS,
  STATE_SAVE_INTERVAL_SECONDS,
  STORAGE_DEBOUNCE_MS,
  TICK_INTERVAL_MS,
} from '../utils/constants'

export interface TimerState {
  tabId: string
  hours: number
  minutes: number
  seconds: number
  isRunning: boolean
  isPaused: boolean
  remainingSeconds: number
  initialSeconds: number
  startTime: number | null
  pausedAt: number | null
  pausedRemaining: number | null
  timerFinishedWhileInactive?: boolean
  label?: string
}

const STORAGE_KEY = 'timer-state'
const TAB_ID_KEY = 'timer-tab-id'

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

  let intervalId: number | null = null
  let saveTimeout: number | null = null

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
    setStorageItem(`${STORAGE_KEY}-${tabId.value}`, state)
  }

  const debouncedSaveState = () => {
    if (saveTimeout !== null) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = window.setTimeout(() => {
      saveState()
    }, STORAGE_DEBOUNCE_MS)
  }

  const startTicking = () => {
    if (intervalId !== null) {
      return
    }
    intervalId = window.setInterval(() => {
      tick()
    }, TICK_INTERVAL_MS)
  }

  const stopTicking = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const loadState = (): boolean => {
    const state = getStorageItem<TimerState | null>(`${STORAGE_KEY}-${tabId.value}`, null)
    if (!state) {
      return false
    }

    hours.value = state.hours || 0
    minutes.value = state.minutes || 0
    seconds.value = state.seconds || 0
    initialSeconds.value = state.initialSeconds || 0
    isPaused.value = state.isPaused || false
    startTime.value = state.startTime ?? null
    pausedAt.value = state.pausedAt ?? null
    pausedRemaining.value = state.pausedRemaining ?? null
    timerFinishedWhileInactive.value = state.timerFinishedWhileInactive || false
    label.value = state.label || ''

    if (state.isRunning && !state.isPaused && state.startTime) {
      const now = Date.now()
      const elapsed = Math.floor((now - state.startTime) / 1000)
      const calculatedRemaining = state.initialSeconds - elapsed

      if (calculatedRemaining > 0) {
        remainingSeconds.value = calculatedRemaining
        isRunning.value = true
        timerFinishedWhileInactive.value = false
        return true
      } else {
        remainingSeconds.value = 0
        isRunning.value = false
        isPaused.value = false
        timerFinishedWhileInactive.value = true
        saveState()
        return false
      }
    } else if (state.isPaused && state.pausedRemaining !== null) {
      remainingSeconds.value = state.pausedRemaining
      isRunning.value = false
      isPaused.value = true
      return false
    } else {
      remainingSeconds.value = state.remainingSeconds || 0
      isRunning.value = false
      isPaused.value = false
      return false
    }
  }

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

  const clearFinishedIndicator = () => {
    timerFinishedWhileInactive.value = false
    saveState()
  }

  const updateTimeFromRemaining = () => {
    const total = remainingSeconds.value
    hours.value = Math.floor(total / 3600)
    const remaining = total % 3600
    minutes.value = Math.floor(remaining / 60)
    seconds.value = remaining % 60
  }

  const start = () => {
    const total = hours.value * 3600 + minutes.value * 60 + seconds.value
    if (total === 0) {
      return
    }

    initialSeconds.value = total
    remainingSeconds.value = total
    isRunning.value = true
    isPaused.value = false
    startTime.value = Date.now()
    pausedAt.value = null
    pausedRemaining.value = null
    timerFinishedWhileInactive.value = false
    saveState()
    startTicking()
  }

  const pause = () => {
    if (!isRunning.value) {
      return
    }

    isPaused.value = true
    isRunning.value = false
    pausedAt.value = Date.now()
    pausedRemaining.value = remainingSeconds.value
    startTime.value = null
    stopTicking()
    saveState()
  }

  const resume = () => {
    if (!isPaused.value || pausedRemaining.value === null) {
      return
    }

    isPaused.value = false
    isRunning.value = true
    remainingSeconds.value = pausedRemaining.value
    const elapsed = initialSeconds.value - pausedRemaining.value
    startTime.value = Date.now() - elapsed * 1000
    pausedAt.value = null
    pausedRemaining.value = null
    saveState()
    startTicking()
  }

  const stop = () => {
    isRunning.value = false
    isPaused.value = false
    startTime.value = null
    pausedAt.value = null
    pausedRemaining.value = null
    timerFinishedWhileInactive.value = false
    stopTicking()
    saveState()
  }

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

  const setLabel = (newLabel: string) => {
    label.value = newLabel.trim()
    debouncedSaveState()
  }

  const tick = () => {
    if (isRunning.value && !isPaused.value && startTime.value) {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime.value) / 1000)
      const calculatedRemaining = initialSeconds.value - elapsed

      if (calculatedRemaining > 0) {
        remainingSeconds.value = calculatedRemaining
        updateTimeFromRemaining()
        if (elapsed % STATE_SAVE_INTERVAL_SECONDS === 0) {
          saveState()
        }
      } else {
        remainingSeconds.value = 0
        stop()
        timerFinishedWhileInactive.value = true
        saveState()
        updateTimeFromRemaining()
        return true
      }
    }
    return false
  }

  const setTime = (h: number, m: number, s: number) => {
    hours.value = Math.max(0, Math.min(MAX_HOURS, h))
    minutes.value = Math.max(0, Math.min(MAX_MINUTES, m))
    seconds.value = Math.max(0, Math.min(MAX_SECONDS, s))
    if (!isRunning.value) {
      timerFinishedWhileInactive.value = false
    }
    debouncedSaveState()
  }

  const addTime = (additionalSeconds: number) => {
    if (isRunning.value && !isPaused.value) {
      remainingSeconds.value = Math.max(0, remainingSeconds.value + additionalSeconds)
      initialSeconds.value = initialSeconds.value + additionalSeconds
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
      if (!isRunning.value) {
        timerFinishedWhileInactive.value = false
      }
    }
    debouncedSaveState()
  }

  const shouldResume = loadState()
  if (shouldResume) {
    updateTimeFromRemaining()
    startTicking()
  }

  return {
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
    debouncedSaveState,
    loadState,
    clearState,
    clearFinishedIndicator,
    updateTimeFromRemaining,
    startTicking,
    stopTicking,
  }
})
