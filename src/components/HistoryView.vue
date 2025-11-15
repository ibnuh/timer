<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-card rounded-lg p-6 shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">History</h2>
        <button
          @click="clearHistory"
          :disabled="historyStore.entries.length === 0"
          class="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      <div v-if="historyStore.entries.length === 0" class="text-center py-8 text-muted-foreground">
        No history yet
      </div>

      <div v-else class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="entry in historyStore.entries"
          :key="entry.id"
          class="flex justify-between items-center p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                entry.type === 'timer' ? 'bg-primary' : 'bg-accent',
              ]"
            />
            <div>
              <div class="font-medium capitalize">{{ entry.type }}</div>
              <div class="text-sm text-muted-foreground">
                {{ formatDate(entry.timestamp) }}
              </div>
            </div>
          </div>
          <div class="font-mono font-semibold">
            {{ formatDuration(entry.duration) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Backup Settings -->
    <div class="mt-6 bg-card rounded-lg p-6 shadow-lg">
      <h2 class="text-2xl font-bold mb-4">Backup & Restore</h2>
      <div class="flex gap-4">
        <button
          @click="exportData"
          class="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Export Settings & History
        </button>
        <label class="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors cursor-pointer">
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
</template>

<script setup lang="ts">
import { useHistoryStore } from '../stores/history'
import { useSettingsStore } from '../stores/settings'

const historyStore = useHistoryStore()
const settingsStore = useSettingsStore()

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const clearHistory = () => {
  if (confirm('Are you sure you want to clear all history?')) {
    historyStore.clearHistory()
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
</script>

