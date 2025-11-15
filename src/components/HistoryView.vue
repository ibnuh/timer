<template>
  <div class="flex flex-col h-full">
    <!-- History -->
    <div class="flex flex-col h-full">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-base font-bold text-foreground">History</h2>
        <button
          @click="clearHistory"
          :disabled="timerEntries.length === 0"
          class="px-3 py-1.5 rounded-md text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      <div v-if="timerEntries.length === 0" class="flex items-center justify-center py-12 text-sm text-foreground/60">
        No history yet
      </div>

      <div v-else class="flex-1 overflow-y-auto space-y-2">
        <div
          v-for="entry in timerEntries.slice(0, 10)"
          :key="entry.id"
          class="flex justify-between items-center p-3 bg-secondary rounded-md hover:bg-secondary/90 transition-colors border border-border/50"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-2 h-2 rounded-full flex-shrink-0 bg-primary" />
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold capitalize truncate text-foreground">Timer</div>
              <div class="text-xs text-foreground/70 truncate mt-0.5">
                {{ formatDateShort(entry.timestamp) }}
              </div>
            </div>
          </div>
          <div class="font-mono text-sm font-bold ml-2 text-foreground">
            {{ formatDuration(entry.duration) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '../stores/history'

const historyStore = useHistoryStore()

const timerEntries = computed(() => {
  return historyStore.entries.filter(e => e.type === 'timer')
})

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
</script>

