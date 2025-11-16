<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Compact Header -->
    <header ref="headerRef" class="flex items-center justify-between px-4 py-2 border-b border-border/60 h-14 flex-shrink-0">
      <h1 class="text-xl font-bold text-foreground">Timer</h1>
      <div class="flex gap-2 items-center">
        <button
          @click="toggleHistory"
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
        <a
          href="https://github.com/ibnuh/timer"
          target="_blank"
          rel="noopener noreferrer"
          class="p-1.5 rounded-md hover:bg-secondary transition-colors flex items-center gap-1.5"
          aria-label="View on GitHub"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-2.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653.652.242 1.873.118 2.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <span class="text-xs font-medium text-foreground">github/ibnuh/timer</span>
        </a>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Timer Content -->
      <div class="flex-1" :class="showHistory ? 'lg:mr-80' : ''">
        <div class="container mx-auto max-w-4xl px-4 py-2">
          <div class="flex justify-center">
            <div class="w-full max-w-2xl">
              <TimerView ref="timerRef" />
            </div>
          </div>
        </div>
      </div>

      <!-- History Sidebar -->
      <div
        v-if="showHistory"
        class="hidden lg:block fixed right-0 top-14 bottom-0 w-80 border-l border-border/60 bg-background overflow-y-auto"
      >
        <div class="p-4">
          <HistoryView />
        </div>
      </div>

      <!-- History for Mobile (below timer) -->
      <div v-if="showHistory" class="lg:hidden w-full">
        <div class="container mx-auto max-w-4xl px-4 pb-6">
          <HistoryView />
        </div>
      </div>

      <!-- Keyboard Shortcuts Display for Mobile (at bottom of content) -->
      <div class="lg:hidden w-full border-t border-border/60 bg-background/50">
        <div class="container mx-auto max-w-4xl px-4 py-3">
          <div 
            class="text-xs font-medium text-center"
            :class="timerFinished ? 'text-primary' : 'text-foreground/70'"
          >
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <div class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">Space</kbd>
                <span>Start/Pause</span>
              </div>
              <span class="text-foreground/30">•</span>
              <div class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">R</kbd>
                <span>Reset</span>
              </div>
              <span class="text-foreground/30">•</span>
              <div class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">↑↓</kbd>
                <span>Seconds</span>
              </div>
              <span class="text-foreground/30">•</span>
              <div class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">←→</kbd>
                <span>Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyboard Shortcuts Display for Desktop (Floating Bottom Left) -->
    <div class="hidden lg:block fixed bottom-4 left-4 z-40 pointer-events-none">
      <div 
        class="bg-background/90 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 shadow-lg transition-all duration-200"
        :class="timerFinished ? 'border-primary/50 shadow-primary/20' : ''"
      >
        <div 
          class="text-xs font-medium space-y-1 text-left leading-tight"
          :class="timerFinished ? 'text-primary' : 'text-foreground/70'"
        >
          <div class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">Space</kbd>
            <span>Start/Pause</span>
            <span class="text-foreground/40">•</span>
            <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">R</kbd>
            <span>Reset</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">↑↓</kbd>
            <span>Seconds</span>
            <span class="text-foreground/40">•</span>
            <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">←→</kbd>
            <span>Minutes</span>
          </div>
          <div class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">R</kbd>
            <span>Repeat</span>
            <span class="text-foreground/40">•</span>
            <kbd class="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] font-mono">D</kbd>
            <span>Dismiss</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Popup -->
    <SettingsPopup :is-open="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from './stores/settings'
import { useTimerStore } from './stores/timer'
import TimerView from './components/TimerView.vue'
import HistoryView from './components/HistoryView.vue'
import SettingsPopup from './components/SettingsPopup.vue'

const settingsStore = useSettingsStore()
const timerStore = useTimerStore()
const isDark = ref(false)
const showHistory = ref(true)
const showSettings = ref(false)

const timerRef = ref<InstanceType<typeof TimerView> | null>(null)
const headerRef = ref<HTMLElement | null>(null)

const timerFinished = computed(() => timerStore.timerFinishedWhileInactive)

// Update tab title with timer time
const updateTabTitle = () => {
  const baseTitle = 'Timer'
  
  if (timerRef.value) {
    const { formattedTime, isRunning, isPaused } = timerRef.value
    if (isRunning || isPaused) {
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
  
  // Load showHistory from settings (default to false)
  showHistory.value = settingsStore.settings.showHistory ?? false
  
  // Listen for system theme changes and update if no user preference is set
  let mediaQuery: MediaQueryList | null = null
  let handleSystemThemeChange: ((e: MediaQueryListEvent) => void) | null = null
  
  if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!settingsStore.hasThemePreference()) {
        // No user preference, update to match system (without saving)
        isDark.value = e.matches
        settingsStore.updateThemeFromSystem()
      }
    }
    
    // Modern browsers
    if (mediaQuery.addEventListener && handleSystemThemeChange) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    } else if (handleSystemThemeChange) {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange)
    }
  }
  
  // Update tab title periodically when timer is running
  const titleInterval = setInterval(() => {
    updateTabTitle()
  }, 100)
  
  // Handle beforeunload confirmation
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (settingsStore.settings.confirmBeforeClose) {
      e.preventDefault()
      // Modern browsers require returnValue to be set
      e.returnValue = ''
      return ''
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(titleInterval)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    // Clean up media query listener
    if (mediaQuery && handleSystemThemeChange) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleSystemThemeChange)
      }
    }
  })
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

const toggleHistory = () => {
  showHistory.value = !showHistory.value
  settingsStore.setShowHistory(showHistory.value)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

