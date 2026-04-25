<template>
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

    <!-- Analytics Summary -->
    <div v-if="timerEntries.length > 0" class="grid grid-cols-2 gap-2 mb-4">
      <div class="bg-secondary/50 rounded-md p-3 border border-border/50">
        <div class="text-xs text-muted-foreground mb-1">Total Focus Time</div>
        <div class="text-lg font-bold text-foreground">{{ formatPresetTime(totalFocusSeconds) }}</div>
      </div>
      <div class="bg-secondary/50 rounded-md p-3 border border-border/50">
        <div class="text-xs text-muted-foreground mb-1">Completed</div>
        <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ completedCount }} / {{ timerEntries.length }}</div>
      </div>
    </div>

    <!-- Today / This Week Bar Chart -->
    <div v-if="dailyStats.length > 0" class="mb-4">
      <div class="text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wide">Last 7 Days</div>
      <div class="flex items-end gap-1 h-16">
        <div
          v-for="day in dailyStats"
          :key="day.label"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <div class="w-full bg-primary/20 rounded-t-sm relative overflow-hidden" style="height: 100%">
            <div
              class="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-500"
              :style="{ height: day.percentage + '%' }"
            ></div>
          </div>
          <div class="text-[10px] text-muted-foreground">{{ day.label }}</div>
        </div>
      </div>
    </div>

    <div v-if="timerEntries.length === 0" class="flex items-center justify-center py-12 text-sm text-foreground/60">
      No history yet
    </div>

    <div v-else class="flex-1 overflow-y-auto space-y-2">
      <div
        v-for="entry in displayedEntries"
        :key="entry.id"
        class="flex justify-between items-center p-3 bg-secondary rounded-md hover:bg-secondary/90 transition-colors border border-border/50"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="entry.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-medium px-1.5 py-0.5 rounded"
                :class="entry.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'"
              >
                {{ entry.status }}
              </span>
              <div class="text-sm font-semibold capitalize truncate text-foreground">
                <span v-if="editingId !== entry.id" @click="startEdit(entry)" class="cursor-pointer hover:underline">
                  {{ entry.label || 'Timer' }}
                </span>
                <input
                  v-else
                  v-model="editLabel"
                  @blur="saveEdit(entry.id)"
                  @keyup.enter="saveEdit(entry.id)"
                  @keyup.esc="cancelEdit"
                  ref="editInput"
                  class="w-full text-sm bg-transparent border-b border-primary focus:outline-none"
                  maxlength="50"
                />
              </div>
            </div>
            <div class="text-xs text-foreground/70 truncate mt-0.5">
              {{ formatDateShort(entry.timestamp) }}
              <span v-if="entry.finishedAt">&bull; {{ formatTimeOnly(new Date(entry.finishedAt)) }}</span>
            </div>
          </div>
        </div>
        <div class="font-mono text-sm font-bold ml-2 text-foreground">
          {{ formatDuration(entry.duration) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useHistoryStore } from '../stores/history'
import type { HistoryEntry } from '../stores/history'
import { formatDuration, formatDateShort, formatTimeOnly, formatPresetTime } from '../utils/timeFormatter'

const historyStore = useHistoryStore()

const timerEntries = computed(() => {
  return historyStore.entries.filter((e: HistoryEntry) => e.type === 'timer')
})

const displayedEntries = computed(() => timerEntries.value.slice(0, 10))

const totalFocusSeconds = computed(() => {
  return timerEntries.value
    .filter((e) => e.status === 'completed')
    .reduce((sum, e) => sum + e.duration, 0)
})

const completedCount = computed(() => {
  return timerEntries.value.filter((e) => e.status === 'completed').length
})

const dailyStats = computed(() => {
  const now = new Date()
  const days: { label: string; seconds: number; percentage: number }[] = []
  const maxSeconds = 3600 // 1 hour = 100% bar height

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayEntries = timerEntries.value.filter((e) => {
      return e.status === 'completed' && e.timestamp >= date.getTime() && e.timestamp < nextDate.getTime()
    })
    const seconds = dayEntries.reduce((sum, e) => sum + e.duration, 0)

    days.push({
      label: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      seconds,
      percentage: Math.min(100, (seconds / maxSeconds) * 100),
    })
  }

  return days
})

const editingId = ref<string | null>(null)
const editLabel = ref('')
const editInput = ref<HTMLInputElement | null>(null)

const startEdit = (entry: HistoryEntry) => {
  editingId.value = entry.id
  editLabel.value = entry.label || ''
  nextTick(() => {
    editInput.value?.focus()
  })
}

const saveEdit = (id: string) => {
  historyStore.updateEntryLabel(id, editLabel.value)
  editingId.value = null
  editLabel.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  editLabel.value = ''
}

const clearHistory = () => {
  if (confirm('Are you sure you want to clear all history?')) {
    historyStore.clearHistory()
  }
}
</script>
