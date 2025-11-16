import { useSettingsStore } from '../stores/settings'

let audioContext: AudioContext | null = null
let repeatTimeoutId: number | null = null
let repeatIntervalId: number | null = null

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export const playBeep = (frequency = 800, duration = 200) => {
  const settingsStore = useSettingsStore()
  
  if (!settingsStore.settings.soundEnabled) {
    return
  }

  // Check if tab is hidden and silent mode is enabled
  if (settingsStore.settings.silentOnTabOpen && document.hidden) {
    return
  }

  try {
    const ctx = initAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration / 1000)
  } catch (error) {
    console.error('Failed to play sound', error)
  }
}

const playNotificationSequence = () => {
  playBeep(600, 300)
  setTimeout(() => playBeep(800, 300), 300)
  setTimeout(() => playBeep(1000, 400), 600)
}

export const playNotification = () => {
  const settingsStore = useSettingsStore()
  
  // Stop any existing repeat
  stopRepeatingBells()
  
  // Play the notification sequence
  playNotificationSequence()
  
  // If repeat bells is enabled, start repeating
  if (settingsStore.settings.repeatBells) {
    // Start repeating after the initial sequence completes (about 1 second)
    repeatTimeoutId = window.setTimeout(() => {
      repeatIntervalId = window.setInterval(() => {
        // Check if repeat bells is still enabled
        const currentSettings = useSettingsStore()
        if (!currentSettings.settings.repeatBells) {
          stopRepeatingBells()
          return
        }
        playNotificationSequence()
      }, 2000) // Repeat every 2 seconds
    }, 1000)
  }
}

export const stopRepeatingBells = () => {
  if (repeatTimeoutId !== null) {
    clearTimeout(repeatTimeoutId)
    repeatTimeoutId = null
  }
  if (repeatIntervalId !== null) {
    clearInterval(repeatIntervalId)
    repeatIntervalId = null
  }
}

