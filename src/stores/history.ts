import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorageItem, setStorageItem } from '../utils/safeStorage'
import { MAX_HISTORY_ENTRIES } from '../utils/constants'

export type HistoryEntryStatus = 'started' | 'completed'

export interface HistoryEntry {
  id: string
  type: 'timer'
  status: HistoryEntryStatus
  duration: number
  timestamp: number
  finishedAt?: number
  label?: string
}

const STORAGE_KEY = 'timer-history'

export const useHistoryStore = defineStore('history', () => {
  const entries = ref<HistoryEntry[]>([])

  const loadHistory = () => {
    entries.value = getStorageItem<HistoryEntry[]>(STORAGE_KEY, [])
  }

  const saveHistory = () => {
    setStorageItem(STORAGE_KEY, entries.value)
  }

  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    entries.value.unshift({
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    })
    if (entries.value.length > MAX_HISTORY_ENTRIES) {
      entries.value = entries.value.slice(0, MAX_HISTORY_ENTRIES)
    }
    saveHistory()
  }

  const updateEntryLabel = (id: string, newLabel: string) => {
    const entry = entries.value.find((e) => e.id === id)
    if (entry) {
      entry.label = newLabel.trim()
      saveHistory()
    }
  }

  const clearHistory = () => {
    entries.value = []
    saveHistory()
  }

  loadHistory()

  return {
    entries,
    addEntry,
    updateEntryLabel,
    clearHistory,
    saveHistory,
  }
})
