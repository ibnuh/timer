<template>
  <div class="h-full flex flex-col gap-3">
    <!-- History -->
    <div class="bg-card rounded-lg p-3 shadow-sm border border-border/20 flex-1 flex flex-col min-h-0">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-sm font-bold">History</h2>
        <button
          @click="clearHistory"
          :disabled="historyStore.entries.length === 0"
          class="px-2 py-1 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      <div v-if="historyStore.entries.length === 0" class="flex-1 flex items-center justify-center text-xs text-muted-foreground">
        No history yet
      </div>

      <div v-else class="flex-1 overflow-y-auto space-y-1.5">
        <div
          v-for="entry in historyStore.entries.slice(0, 10)"
          :key="entry.id"
          class="flex justify-between items-center p-2 bg-secondary/50 rounded-md hover:bg-secondary transition-colors"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div
              :class="[
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                entry.type === 'timer' ? 'bg-primary' : 'bg-accent',
              ]"
            />
            <div class="min-w-0 flex-1">
              <div class="text-xs font-medium capitalize truncate">{{ entry.type }}</div>
              <div class="text-xs text-muted-foreground truncate">
                {{ formatDateShort(entry.timestamp) }}
              </div>
            </div>
          </div>
          <div class="font-mono text-xs font-semibold ml-2">
            {{ formatDuration(entry.duration) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Backup Settings -->
    <div class="bg-card rounded-lg p-3 shadow-sm border border-border/20">
      <h2 class="text-sm font-bold mb-2">Backup & Restore</h2>
      <div class="flex flex-col gap-2">
        <button
          @click="exportData"
          class="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Export
        </button>
        <label class="w-full px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors cursor-pointer text-center">
          <input
            type="file"
            accept=".json"
            @change="importData"
            class="hidden"
          />
          Import
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

const formatDateShort = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
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

