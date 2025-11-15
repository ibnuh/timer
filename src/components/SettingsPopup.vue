<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="close"
    >
      <div class="bg-card rounded-lg shadow-lg border border-border/20 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col m-4">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border/20">
          <h2 class="text-lg font-bold">Settings</h2>
          <button
            @click="close"
            class="p-1 rounded-md hover:bg-secondary transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <!-- Sound Settings -->
          <div>
            <h3 class="text-sm font-semibold mb-3">Sound</h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="soundEnabled"
                  @change="updateSoundSetting"
                  class="w-4 h-4 rounded"
                />
                <span class="text-sm">Sound enabled</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="silentOnTabOpen"
                  @change="updateSilentSetting"
                  class="w-4 h-4 rounded"
                />
                <span class="text-sm">Silent when tab is not active</span>
              </label>
            </div>
          </div>

          <!-- General Settings -->
          <div>
            <h3 class="text-sm font-semibold mb-3">General</h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="confirmBeforeClose"
                  @change="updateConfirmBeforeClose"
                  class="w-4 h-4 rounded"
                />
                <span class="text-sm">Confirm before closing tab or window</span>
              </label>
            </div>
          </div>

          <!-- Custom Presets -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold">Custom Presets</h3>
              <button
                @click="showAddPreset = true"
                class="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                + Add
              </button>
            </div>
            <div v-if="customPresets.length === 0" class="text-xs text-muted-foreground text-center py-4">
              No custom presets
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="preset in customPresets"
                :key="preset.id"
                class="flex items-center gap-2 p-2 bg-secondary/50 rounded-md"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ preset.label }}</div>
                  <div class="text-xs text-muted-foreground">{{ formatPresetTime(preset.seconds) }}</div>
                </div>
                <button
                  @click="editPreset(preset)"
                  class="p-1.5 rounded hover:bg-secondary transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="removePreset(preset.id!)"
                  class="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add/Edit Preset Form -->
          <div v-if="showAddPreset || editingPreset" class="p-3 bg-secondary/30 rounded-md space-y-3">
            <div>
              <label class="block text-xs font-medium mb-1">Label</label>
              <input
                v-model="presetForm.label"
                type="text"
                placeholder="e.g., Coffee Break"
                class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium mb-1">Time (seconds)</label>
              <div class="flex items-center gap-2">
                <button
                  @click="adjustPresetTime(-5)"
                  class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
                >
                  -5s
                </button>
                <input
                  v-model.number="presetForm.seconds"
                  type="number"
                  min="0"
                  class="flex-1 px-3 py-2 rounded-md border border-input bg-background text-center text-sm"
                />
                <button
                  @click="adjustPresetTime(5)"
                  class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
                >
                  +5s
                </button>
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                {{ formatPresetTime(presetForm.seconds) }}
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="savePreset"
                class="flex-1 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {{ editingPreset ? 'Update' : 'Add' }}
              </button>
              <button
                @click="cancelPresetEdit"
                class="px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Backup & Restore -->
          <div>
            <h3 class="text-sm font-semibold mb-3">Backup & Restore</h3>
            <div class="flex flex-col gap-2">
              <button
                @click="exportData"
                class="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Export Settings & History
              </button>
              <label class="w-full px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors cursor-pointer text-center">
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
const confirmBeforeClose = ref(settingsStore.settings.confirmBeforeClose)
const showAddPreset = ref(false)
const editingPreset = ref<TimerPreset | null>(null)
const presetForm = ref({ label: '', seconds: 60 })

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

const updateConfirmBeforeClose = () => {
  settingsStore.setConfirmBeforeClose(confirmBeforeClose.value)
}

const adjustPresetTime = (delta: number) => {
  presetForm.value.seconds = Math.max(0, presetForm.value.seconds + delta)
}

const savePreset = () => {
  if (!presetForm.value.label.trim() || presetForm.value.seconds <= 0) {
    return
  }
  
  if (editingPreset.value) {
    settingsStore.updateCustomPreset(editingPreset.value.id!, presetForm.value)
  } else {
    settingsStore.addCustomPreset(presetForm.value)
  }
  
  cancelPresetEdit()
}

const cancelPresetEdit = () => {
  showAddPreset.value = false
  editingPreset.value = null
  presetForm.value = { label: '', seconds: 60 }
}

const editPreset = (preset: TimerPreset) => {
  editingPreset.value = preset
  presetForm.value = { label: preset.label, seconds: preset.seconds }
  showAddPreset.value = false
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

const close = () => {
  cancelPresetEdit()
  emit('close')
}

watch(
  () => settingsStore.settings.soundEnabled,
  (val) => {
    soundEnabled.value = val
  }
)

watch(
  () => settingsStore.settings.silentOnTabOpen,
  (val) => {
    silentOnTabOpen.value = val
  }
)

watch(
  () => settingsStore.settings.confirmBeforeClose,
  (val) => {
    confirmBeforeClose.value = val
  }
)
</script>

