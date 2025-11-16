import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface TimerPreset {
  label: string
  seconds: number
  id?: string
}

export interface Settings {
  theme: 'light' | 'dark'
  soundEnabled: boolean
  silentOnTabOpen: boolean
  repeatBells: boolean
  confirmBeforeClose: boolean
  showHistory: boolean
  notificationsEnabled: boolean
  customPresets: TimerPreset[]
  defaultPresets: TimerPreset[]
}

const DEFAULT_PRESETS: TimerPreset[] = [
  { label: '2min', seconds: 120, id: 'default-2min' },
  { label: '3min', seconds: 180, id: 'default-3min' },
  { label: '5min', seconds: 300, id: 'default-5min' },
  { label: '10min', seconds: 600, id: 'default-10min' },
  { label: '15min', seconds: 900, id: 'default-15min' },
  { label: '25min', seconds: 1500, id: 'default-25min' },
  { label: '30min', seconds: 1800, id: 'default-30min' },
  { label: '1hr', seconds: 3600, id: 'default-1hr' },
]

// Detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    theme: 'light',
    soundEnabled: true,
    silentOnTabOpen: false,
    repeatBells: false,
    confirmBeforeClose: true,
    showHistory: false,
    notificationsEnabled: true,
    customPresets: [],
    defaultPresets: [...DEFAULT_PRESETS],
  })

  // Track if we're currently loading settings (to prevent auto-save during load)
  let isLoadingSettings = false
  // Track if we're updating theme from system (to prevent auto-save)
  let isUpdatingFromSystem = false

  const loadSettings = () => {
    isLoadingSettings = true
    const saved = localStorage.getItem('timer-settings')
    if (saved) {
      try {
        const loaded = JSON.parse(saved)
        // Migrate old settings: if defaultPresets doesn't exist, initialize with defaults
        if (!loaded.defaultPresets) {
          loaded.defaultPresets = [...DEFAULT_PRESETS]
        }
        settings.value = { ...settings.value, ...loaded }
        if (settings.value.theme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      } catch (e) {
        console.error('Failed to load settings', e)
      }
    } else {
      // No saved settings - use system preference for theme
      const systemTheme = getSystemTheme()
      settings.value.theme = systemTheme
      if (systemTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // Don't save system preference - let it be detected each time if user hasn't set it
    }
    isLoadingSettings = false
  }

  const saveSettings = () => {
    // Only save if not currently loading or updating from system (to avoid saving system preference)
    if (!isLoadingSettings && !isUpdatingFromSystem) {
      localStorage.setItem('timer-settings', JSON.stringify(settings.value))
    }
  }
  
  // Update theme from system preference (without saving)
  const updateThemeFromSystem = () => {
    if (!hasThemePreference()) {
      isUpdatingFromSystem = true
      const systemTheme = getSystemTheme()
      settings.value.theme = systemTheme
      if (systemTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // Use nextTick to ensure watcher has processed, then reset flag
      setTimeout(() => {
        isUpdatingFromSystem = false
      }, 0)
    }
  }

  const setTheme = (theme: 'light' | 'dark') => {
    settings.value.theme = theme
    // Explicitly save when user sets theme
    localStorage.setItem('timer-settings', JSON.stringify(settings.value))
  }
  
  // Check if user has explicitly set a theme preference
  const hasThemePreference = (): boolean => {
    const saved = localStorage.getItem('timer-settings')
    if (!saved) return false
    try {
      const loaded = JSON.parse(saved)
      return loaded.theme !== undefined
    } catch {
      return false
    }
  }

  const setSoundEnabled = (enabled: boolean) => {
    settings.value.soundEnabled = enabled
    saveSettings()
  }

  const setSilentOnTabOpen = (silent: boolean) => {
    settings.value.silentOnTabOpen = silent
    saveSettings()
  }

  const setRepeatBells = (repeat: boolean) => {
    settings.value.repeatBells = repeat
    saveSettings()
  }

  const setConfirmBeforeClose = (confirm: boolean) => {
    settings.value.confirmBeforeClose = confirm
    saveSettings()
  }

  const setShowHistory = (show: boolean) => {
    settings.value.showHistory = show
    saveSettings()
  }

  const setNotificationsEnabled = (enabled: boolean) => {
    settings.value.notificationsEnabled = enabled
    saveSettings()
  }

  const addCustomPreset = (preset: TimerPreset) => {
    if (!settings.value.customPresets) {
      settings.value.customPresets = []
    }
    settings.value.customPresets.push({
      ...preset,
      id: preset.id || Date.now().toString(),
    })
    saveSettings()
  }

  const removeCustomPreset = (id: string) => {
    if (settings.value.customPresets) {
      settings.value.customPresets = settings.value.customPresets.filter(p => p.id !== id)
      saveSettings()
    }
  }

  const updateCustomPreset = (id: string, preset: Partial<TimerPreset>) => {
    if (settings.value.customPresets) {
      const index = settings.value.customPresets.findIndex(p => p.id === id)
      if (index !== -1) {
        settings.value.customPresets[index] = { ...settings.value.customPresets[index], ...preset }
        saveSettings()
      }
    }
  }

  const updateDefaultPreset = (id: string, preset: Partial<TimerPreset>) => {
    if (settings.value.defaultPresets) {
      const index = settings.value.defaultPresets.findIndex(p => p.id === id)
      if (index !== -1) {
        settings.value.defaultPresets[index] = { ...settings.value.defaultPresets[index], ...preset }
        saveSettings()
      }
    }
  }

  const resetDefaultPresets = () => {
    settings.value.defaultPresets = [...DEFAULT_PRESETS]
    saveSettings()
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'timer-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          settings.value = { ...settings.value, ...imported }
          saveSettings()
          if (settings.value.theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  watch(settings, saveSettings, { deep: true })

  return {
    settings,
    loadSettings,
    saveSettings,
    setTheme,
    hasThemePreference,
    updateThemeFromSystem,
    setSoundEnabled,
    setSilentOnTabOpen,
    setRepeatBells,
    setConfirmBeforeClose,
    setShowHistory,
    setNotificationsEnabled,
    addCustomPreset,
    removeCustomPreset,
    updateCustomPreset,
    updateDefaultPreset,
    resetDefaultPresets,
    exportSettings,
    importSettings,
  }
})

