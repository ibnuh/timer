<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="close"
    >
      <div class="bg-card rounded-lg shadow-lg border border-border/20 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-border/20">
          <h2 class="text-xl font-bold">Settings</h2>
          <button
            @click="close"
            class="p-2 rounded-md hover:bg-secondary transition-colors"
            aria-label="Close settings"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Settings Grid: Sound & General Side by Side -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Sound Settings -->
            <div class="bg-secondary/30 rounded-lg p-4">
              <h3 class="text-base font-semibold mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Sound
              </h3>
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    v-model="soundEnabled"
                    @change="updateSoundSetting"
                    class="w-5 h-5 rounded border-input cursor-pointer"
                  />
                  <span class="text-sm group-hover:text-foreground transition-colors">Sound enabled</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    v-model="silentOnTabOpen"
                    @change="updateSilentSetting"
                    class="w-5 h-5 rounded border-input cursor-pointer"
                  />
                  <span class="text-sm group-hover:text-foreground transition-colors">Silent when tab is not active</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    v-model="repeatBells"
                    @change="updateRepeatBellsSetting"
                    class="w-5 h-5 rounded border-input cursor-pointer"
                  />
                  <span class="text-sm group-hover:text-foreground transition-colors">Repeat bells</span>
                </label>
              </div>
            </div>

            <!-- General Settings -->
            <div class="bg-secondary/30 rounded-lg p-4">
              <h3 class="text-base font-semibold mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                General
              </h3>
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    v-model="confirmBeforeClose"
                    @change="updateConfirmBeforeClose"
                    class="w-5 h-5 rounded border-input cursor-pointer"
                  />
                  <span class="text-sm group-hover:text-foreground transition-colors">Confirm before closing tab or window</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    v-model="notificationsEnabled"
                    @change="updateNotificationsSetting"
                    class="w-5 h-5 rounded border-input cursor-pointer"
                  />
                  <span class="text-sm group-hover:text-foreground transition-colors">Send browser notifications</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Presets Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Default Presets -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Default Presets
                </h3>
                <button
                  @click="resetDefaultPresets"
                  class="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                >
                  Reset
                </button>
              </div>
              <div v-if="defaultPresets.length === 0" class="text-sm text-muted-foreground text-center py-8 bg-secondary/20 rounded-lg">
                No default presets
              </div>
              <div v-else class="grid grid-cols-2 gap-2">
                <div
                  v-for="preset in defaultPresets"
                  :key="preset.id"
                  class="group flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-primary/20 hover:bg-secondary/70 hover:border-primary/40 transition-all cursor-pointer"
                  @click="editPreset(preset, true)"
                >
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">{{ preset.label }}</div>
                    <div class="text-xs text-muted-foreground">{{ formatPresetTime(preset.seconds) }}</div>
                  </div>
                  <button
                    @click.stop="editPreset(preset, true)"
                    class="p-1.5 rounded hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Edit preset"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom Presets -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-semibold flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Custom Presets
                </h3>
                <button
                  @click="showAddPreset = true"
                  class="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
              <div v-if="customPresets.length === 0" class="text-sm text-muted-foreground text-center py-8 bg-secondary/20 rounded-lg">
                No custom presets
              </div>
              <div v-else class="grid grid-cols-2 gap-2">
                <div
                  v-for="preset in customPresets"
                  :key="preset.id"
                  class="group flex items-center gap-2 p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-all"
                >
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium truncate">{{ preset.label }}</div>
                    <div class="text-xs text-muted-foreground">{{ formatPresetTime(preset.seconds) }}</div>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="editPreset(preset)"
                      class="p-1.5 rounded hover:bg-secondary transition-colors"
                      aria-label="Edit preset"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="preset.id && removePreset(preset.id)"
                      class="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
                      aria-label="Remove preset"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add/Edit Preset Form -->
          <div v-if="showAddPreset || editingPreset" class="p-5 bg-secondary/30 rounded-lg border border-border/20 space-y-4 mb-6">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">
                {{ editingPreset ? 'Edit Preset' : 'Add New Preset' }}
              </h3>
              <div v-if="editingPreset && isEditingDefault" class="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-medium">
                Default Preset
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Label</label>
                <input
                  v-model="presetForm.label"
                  type="text"
                  placeholder="e.g., Coffee Break"
                  class="w-full px-4 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Time</label>
                <div class="flex items-center gap-2">
                  <button
                    @click="adjustPresetTime(-5)"
                    class="px-4 py-2.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium min-w-[60px]"
                  >
                    -5s
                  </button>
                  <input
                    v-model.number="presetForm.seconds"
                    type="number"
                    min="0"
                    class="flex-1 px-4 py-2.5 rounded-md border border-input bg-background text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    @click="adjustPresetTime(5)"
                    class="px-4 py-2.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium min-w-[60px]"
                  >
                    +5s
                  </button>
                </div>
                <div class="text-xs text-muted-foreground mt-2 text-center font-medium">
                  {{ formatPresetTime(presetForm.seconds) }}
                </div>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button
                @click="savePreset"
                class="flex-1 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ editingPreset ? 'Update Preset' : 'Add Preset' }}
              </button>
              <button
                @click="cancelPresetEdit"
                class="px-4 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Backup & Restore -->
          <div class="bg-secondary/30 rounded-lg p-5 mb-6">
            <h3 class="text-base font-semibold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Backup & Restore
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                @click="exportData"
                class="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Settings & History
              </button>
              <label class="w-full px-4 py-3 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors cursor-pointer text-center flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <input
                  type="file"
                  accept=".json"
                  @change="importData"
                  class="hidden"
                />
                Import Settings & History
              </label>
            </div>
          </div>

          <!-- Reset Data -->
          <div class="bg-destructive/10 rounded-lg p-5 border border-destructive/20">
            <h3 class="text-base font-semibold mb-4 flex items-center gap-2 text-destructive">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset Data
            </h3>
            <p class="text-sm text-muted-foreground mb-4">
              This will permanently delete all your settings, history, presets, and timer states. This action cannot be undone.
            </p>
            <button
              @click="resetAllData"
              class="w-full px-4 py-3 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset Entire Site Data
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useHistoryStore } from '../stores/history'
import type { TimerPreset } from '../stores/settings'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()

const soundEnabled = ref(settingsStore.settings.soundEnabled)
const silentOnTabOpen = ref(settingsStore.settings.silentOnTabOpen)
const repeatBells = ref(settingsStore.settings.repeatBells)
const confirmBeforeClose = ref(settingsStore.settings.confirmBeforeClose)
const notificationsEnabled = ref(settingsStore.settings.notificationsEnabled)
const showAddPreset = ref(false)
const editingPreset = ref<TimerPreset | null>(null)
const isEditingDefault = ref(false)
const presetForm = ref({ label: '', seconds: 60 })

const defaultPresets = computed(() => settingsStore.settings.defaultPresets || [])
const customPresets = computed(() => settingsStore.settings.customPresets || [])

const formatPresetTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

const updateSoundSetting = () => {
  settingsStore.setSoundEnabled(soundEnabled.value)
}

const updateSilentSetting = () => {
  settingsStore.setSilentOnTabOpen(silentOnTabOpen.value)
}

const updateRepeatBellsSetting = () => {
  settingsStore.setRepeatBells(repeatBells.value)
}

const updateConfirmBeforeClose = () => {
  settingsStore.setConfirmBeforeClose(confirmBeforeClose.value)
}

const updateNotificationsSetting = async () => {
  settingsStore.setNotificationsEnabled(notificationsEnabled.value)
  
  // If enabling notifications, request permission if needed
  if (notificationsEnabled.value && 'Notification' in window) {
    if (Notification.permission === 'default') {
      // Request permission (requires user interaction)
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        // User denied permission, disable the setting
        notificationsEnabled.value = false
        settingsStore.setNotificationsEnabled(false)
        alert('Notification permission was denied. Please enable it in your browser settings to receive notifications.')
      }
    } else if (Notification.permission === 'denied') {
      // Permission was previously denied, inform user
      notificationsEnabled.value = false
      settingsStore.setNotificationsEnabled(false)
      alert('Notification permission is denied. Please enable it in your browser settings to receive notifications.')
    }
  }
}

const adjustPresetTime = (delta: number) => {
  presetForm.value.seconds = Math.max(0, presetForm.value.seconds + delta)
}

const savePreset = () => {
  if (!presetForm.value.label.trim() || presetForm.value.seconds <= 0) {
    return
  }
  
  if (editingPreset.value) {
    if (isEditingDefault.value) {
      settingsStore.updateDefaultPreset(editingPreset.value.id!, presetForm.value)
    } else {
      settingsStore.updateCustomPreset(editingPreset.value.id!, presetForm.value)
    }
  } else {
    settingsStore.addCustomPreset(presetForm.value)
  }
  
  cancelPresetEdit()
}

const cancelPresetEdit = () => {
  showAddPreset.value = false
  editingPreset.value = null
  isEditingDefault.value = false
  presetForm.value = { label: '', seconds: 60 }
}

const editPreset = (preset: TimerPreset, isDefault: boolean = false) => {
  editingPreset.value = preset
  isEditingDefault.value = isDefault
  presetForm.value = { label: preset.label, seconds: preset.seconds }
  showAddPreset.value = false
}

const resetDefaultPresets = () => {
  if (confirm('Are you sure you want to reset all default presets to their original values?')) {
    settingsStore.resetDefaultPresets()
  }
}

const removePreset = (id: string) => {
  if (confirm('Are you sure you want to remove this preset?')) {
    settingsStore.removeCustomPreset(id)
  }
}

const exportData = () => {
  const data = {
    settings: settingsStore.settings,
    history: historyStore.entries,
    exportDate: new Date().toISOString(),
  }
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `timer-backup-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const importData = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      if (data.settings) {
        Object.assign(settingsStore.settings, data.settings)
        settingsStore.saveSettings()
        if (settingsStore.settings.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      if (data.history && Array.isArray(data.history)) {
        historyStore.entries = data.history
        historyStore.saveHistory()
      }
      
      alert('Data imported successfully!')
    } catch (error) {
      alert('Failed to import data. Please check the file format.')
      console.error('Import error', error)
    }
  }
  reader.readAsText(file)
  target.value = ''
}

const resetAllData = () => {
  const confirmMessage = 'Are you sure you want to reset ALL data?\n\nThis will permanently delete:\n- All settings\n- All history\n- All presets\n- All timer states\n\nThis action cannot be undone!'
  
  if (confirm(confirmMessage)) {
    // Clear all localStorage items
    const keysToRemove: string[] = []
    
    // Find all timer state keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('timer-state-') || key === 'timer-settings' || key === 'timer-history' || key.startsWith('timer-tab-id'))) {
        keysToRemove.push(key)
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Reset stores
    settingsStore.resetToDefaults()
    historyStore.clearHistory()
    
    // Reload the page to apply changes
    alert('All data has been reset. The page will now reload.')
    window.location.reload()
  }
}

const close = () => {
  cancelPresetEdit()
  emit('close')
}

watch(
  () => settingsStore.settings.soundEnabled,
  (val: boolean) => {
    soundEnabled.value = val
  }
)

watch(
  () => settingsStore.settings.silentOnTabOpen,
  (val: boolean) => {
    silentOnTabOpen.value = val
  }
)

watch(
  () => settingsStore.settings.repeatBells,
  (val: boolean) => {
    repeatBells.value = val
  }
)

watch(
  () => settingsStore.settings.confirmBeforeClose,
  (val: boolean) => {
    confirmBeforeClose.value = val
  }
)

watch(
  () => settingsStore.settings.notificationsEnabled,
  (val: boolean) => {
    notificationsEnabled.value = val
  }
)
</script>

