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
  confirmBeforeClose: boolean
  showHistory: boolean
  customPresets: TimerPreset[]
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    theme: 'light',
    soundEnabled: true,
    silentOnTabOpen: false,
    confirmBeforeClose: true,
    showHistory: true,
    customPresets: [],
  })

  const loadSettings = () => {
    const saved = localStorage.getItem('timer-settings')
    if (saved) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(saved) }
        if (settings.value.theme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      } catch (e) {
        console.error('Failed to load settings', e)
      }
    }
  }

  const saveSettings = () => {
    localStorage.setItem('timer-settings', JSON.stringify(settings.value))
  }

  const setTheme = (theme: 'light' | 'dark') => {
    settings.value.theme = theme
    saveSettings()
  }

  const setSoundEnabled = (enabled: boolean) => {
    settings.value.soundEnabled = enabled
    saveSettings()
  }

  const setSilentOnTabOpen = (silent: boolean) => {
    settings.value.silentOnTabOpen = silent
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
    setSoundEnabled,
    setSilentOnTabOpen,
    setConfirmBeforeClose,
    setShowHistory,
    addCustomPreset,
    removeCustomPreset,
    updateCustomPreset,
    exportSettings,
    importSettings,
  }
})

