import { defineStore } from 'pinia'
import { ref } from 'vue'

export type HistoryEntryStatus = 'started' | 'completed'

export interface HistoryEntry {
  id: string
  type: 'timer'
  status: HistoryEntryStatus
  duration: number
  timestamp: number
  label?: string
}

export const useHistoryStore = defineStore('history', () => {
  const entries = ref<HistoryEntry[]>([])

  const loadHistory = () => {
    const saved = localStorage.getItem('timer-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        entries.value = parsed.map((entry: HistoryEntry) => ({
          ...entry,
          status: entry.status || 'completed',
        }))
      } catch (e) {
        console.error('Failed to load history', e)
      }
    }
  }

  const saveHistory = () => {
    localStorage.setItem('timer-history', JSON.stringify(entries.value))
  }

  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    entries.value.unshift({
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    })
    if (entries.value.length > 100) {
      entries.value = entries.value.slice(0, 100)
    }
    saveHistory()
  }

  const clearHistory = () => {
    entries.value = []
    saveHistory()
  }

  loadHistory()

  return {
    entries,
    addEntry,
    clearHistory,
    saveHistory,
  }
})

