<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-center mb-2">Timer & Stopwatch</h1>
        <div class="flex justify-center gap-4 items-center">
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg hover:bg-secondary transition-colors"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg
              v-if="isDark"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
          <button
            @click="toggleFullscreen"
            class="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle fullscreen"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>
      </header>

      <div class="flex gap-4 mb-6 justify-center">
        <button
          @click="activeTab = 'timer'"
          :class="[
            'px-6 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'timer'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          ]"
        >
          Timer
        </button>
        <button
          @click="activeTab = 'stopwatch'"
          :class="[
            'px-6 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'stopwatch'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          ]"
        >
          Stopwatch
        </button>
      </div>

      <TimerView v-if="activeTab === 'timer'" />
      <StopwatchView v-else />

      <HistoryView class="mt-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from './stores/settings'
import TimerView from './components/TimerView.vue'
import StopwatchView from './components/StopwatchView.vue'
import HistoryView from './components/HistoryView.vue'

const activeTab = ref<'timer' | 'stopwatch'>('timer')
const settingsStore = useSettingsStore()
const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  settingsStore.loadSettings()
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  settingsStore.setTheme(isDark.value ? 'dark' : 'light')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

