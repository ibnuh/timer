<template>
  <div class="h-screen bg-background overflow-hidden flex flex-col">
    <!-- Compact Header -->
    <header class="flex items-center justify-between px-4 py-2 border-b border-border/20">
      <h1 class="text-xl font-bold">Timer & Stopwatch</h1>
      <div class="flex gap-2 items-center">
        <button
          @click="showHistory = !showHistory"
          class="p-1.5 rounded-md hover:bg-secondary transition-colors"
          :aria-label="showHistory ? 'Hide history' : 'Show history'"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button
          @click="showSettings = true"
          class="p-1.5 rounded-md hover:bg-secondary transition-colors"
          aria-label="Open settings"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <button
          @click="toggleTheme"
          class="p-1.5 rounded-md hover:bg-secondary transition-colors"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg
            v-if="isDark"
            class="w-4 h-4"
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
            class="w-4 h-4"
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
          class="p-1.5 rounded-md hover:bg-secondary transition-colors"
          aria-label="Toggle fullscreen"
        >
          <svg
            class="w-4 h-4"
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

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden grid grid-cols-1 gap-3 p-3" :class="showHistory ? 'lg:grid-cols-3' : 'lg:grid-cols-1'">
      <!-- Left: Timer/Stopwatch -->
      <div :class="showHistory ? 'lg:col-span-2' : 'lg:col-span-1'" class="flex flex-col overflow-hidden min-h-0">
        <!-- Tab Switcher -->
        <div class="flex gap-2 mb-2">
          <button
            @click="activeTab = 'timer'"
            :class="[
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'timer'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary',
            ]"
          >
            Timer
          </button>
          <button
            @click="activeTab = 'stopwatch'"
            :class="[
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'stopwatch'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary',
            ]"
          >
            Stopwatch
          </button>
        </div>

        <!-- Timer/Stopwatch View -->
        <div class="flex-1 overflow-hidden min-h-0">
          <TimerView v-if="activeTab === 'timer'" ref="timerRef" />
          <StopwatchView v-else ref="stopwatchRef" />
        </div>
      </div>

      <!-- Right: History & Settings -->
      <div v-if="showHistory" class="lg:col-span-1 flex flex-col gap-3 overflow-hidden min-h-0">
        <HistoryView />
      </div>
    </div>

    <!-- Settings Popup -->
    <SettingsPopup :is-open="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from './stores/settings'
import TimerView from './components/TimerView.vue'
import StopwatchView from './components/StopwatchView.vue'
import HistoryView from './components/HistoryView.vue'
import SettingsPopup from './components/SettingsPopup.vue'

const activeTab = ref<'timer' | 'stopwatch'>('timer')
const settingsStore = useSettingsStore()
const isDark = ref(false)
const showHistory = ref(true)
const showSettings = ref(false)

const timerRef = ref<InstanceType<typeof TimerView> | null>(null)
const stopwatchRef = ref<InstanceType<typeof StopwatchView> | null>(null)

// Update tab title with timer/stopwatch time
const updateTabTitle = () => {
  const baseTitle = 'Timer & Stopwatch'
  
  if (activeTab.value === 'timer' && timerRef.value) {
    const { formattedTime, isRunning, isPaused } = timerRef.value
    if (isRunning || isPaused) {
      document.title = `${formattedTime} - ${baseTitle}`
    } else {
      document.title = baseTitle
    }
  } else if (activeTab.value === 'stopwatch' && stopwatchRef.value) {
    const { formattedTime, isRunning, elapsedTime } = stopwatchRef.value
    if (isRunning || elapsedTime > 0) {
      document.title = `${formattedTime} - ${baseTitle}`
    } else {
      document.title = baseTitle
    }
  } else {
    document.title = baseTitle
  }
}

onMounted(() => {
  // Load settings first
  settingsStore.loadSettings()
  
  // Then sync isDark with the loaded theme
  isDark.value = settingsStore.settings.theme === 'dark'
  
  // Ensure the class matches the theme
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Update tab title periodically when timer/stopwatch is running
  const titleInterval = setInterval(() => {
    updateTabTitle()
  }, 100)
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(titleInterval)
  })
})

watch(activeTab, () => {
  updateTabTitle()
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

