<template>
  <div class="h-full flex flex-col">
    <div class="bg-card rounded-lg p-4 shadow-sm border border-border/20 flex-1 flex flex-col">
      <!-- Circular Timer Display -->
      <div class="flex flex-col items-center mb-4">
        <div class="relative w-48 h-48 mb-4">
          <svg class="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              stroke-width="6"
              fill="none"
              class="text-secondary/30"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              stroke-width="6"
              fill="none"
              class="text-primary transition-all duration-1000"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              stroke-linecap="round"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl font-bold mb-1">{{ formattedTime }}</div>
              <div v-if="isRunning" class="text-xs text-muted-foreground">
                {{ isPaused ? 'Paused' : 'Running' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Add/Subtract Buttons -->
        <div class="flex gap-2 mb-4">
          <button
            @click="addTime(-10)"
            class="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="totalSeconds < 10"
          >
            -10s
          </button>
          <button
            @click="addTime(10)"
            class="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            +10s
          </button>
          <button
            @click="addTime(-30)"
            class="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="totalSeconds < 30"
          >
            -30s
          </button>
          <button
            @click="addTime(30)"
            class="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            +30s
          </button>
        </div>
      </div>

      <!-- Timer Presets -->
      <div class="mb-4">
        <div class="text-xs font-medium mb-2 text-muted-foreground">Quick Presets</div>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="preset in presets"
            :key="preset.label"
            @click="setPreset(preset.seconds)"
            :disabled="isRunning"
            class="px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Time Input Controls -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium mb-1.5 text-muted-foreground">Hours</label>
          <input
            v-model.number="hours"
            type="number"
            min="0"
            max="23"
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            :disabled="isRunning"
            @input="updateTime"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1.5 text-muted-foreground">Minutes</label>
          <input
            v-model.number="minutes"
            type="number"
            min="0"
            max="59"
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            :disabled="isRunning"
            @input="updateTime"
          />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1.5 text-muted-foreground">Seconds</label>
          <input
            v-model.number="seconds"
            type="number"
            min="0"
            max="59"
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            :disabled="isRunning"
            @input="updateTime"
          />
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex gap-2 justify-center mb-4">
        <button
          v-if="!isRunning"
          @click="start"
          :disabled="totalSeconds === 0"
          class="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Start
        </button>
        <button
          v-else-if="isPaused"
          @click="resume"
          class="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Resume
        </button>
        <button
          v-else
          @click="pause"
          class="px-6 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Pause
        </button>
        <button
          @click="reset"
          class="px-6 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
        >
          Reset
        </button>
      </div>

      <!-- Settings -->
      <div class="pt-3 border-t border-border/20">
        <div class="flex items-center justify-between text-xs mb-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="soundEnabled"
              @change="updateSoundSetting"
              class="w-3.5 h-3.5 rounded"
            />
            <span>Sound</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="silentOnTabOpen"
              @change="updateSilentSetting"
              class="w-3.5 h-3.5 rounded"
            />
            <span>Silent (tab inactive)</span>
          </label>
        </div>
        <div class="text-xs text-muted-foreground text-center">
          <span class="opacity-70">Space: Start/Pause • R: Reset • Arrows: Adjust time</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useHistoryStore } from '../stores/history'
import { playNotification } from '../utils/sound'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()

const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const isRunning = ref(false)
const isPaused = ref(false)
const remainingSeconds = ref(0)
const initialSeconds = ref(0)

const soundEnabled = ref(settingsStore.settings.soundEnabled)
const silentOnTabOpen = ref(settingsStore.settings.silentOnTabOpen)

let intervalId: number | null = null

// Timer presets
const presets = [
  { label: '5min', seconds: 300 },
  { label: '10min', seconds: 600 },
  { label: '15min', seconds: 900 },
  { label: '25min', seconds: 1500 },
  { label: '30min', seconds: 1800 },
  { label: '1hr', seconds: 3600 },
]

const totalSeconds = computed(() => {
  if (isRunning.value) {
    return remainingSeconds.value
  }
  return hours.value * 3600 + minutes.value * 60 + seconds.value
})

const formattedTime = computed(() => {
  const h = Math.floor(totalSeconds.value / 3600)
  const m = Math.floor((totalSeconds.value % 3600) / 60)
  const s = totalSeconds.value % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const circumference = 2 * Math.PI * 88
const strokeDashoffset = computed(() => {
  if (initialSeconds.value === 0) return circumference
  const progress = remainingSeconds.value / initialSeconds.value
  return circumference * (1 - progress)
})

const updateTime = () => {
  if (hours.value < 0) hours.value = 0
  if (minutes.value < 0) minutes.value = 0
  if (seconds.value < 0) seconds.value = 0
  if (minutes.value > 59) minutes.value = 59
  if (seconds.value > 59) seconds.value = 59
  if (hours.value > 23) hours.value = 23
}

const addTime = (additionalSeconds: number) => {
  if (isRunning.value) {
    remainingSeconds.value = Math.max(0, remainingSeconds.value + additionalSeconds)
  } else {
    const total = hours.value * 3600 + minutes.value * 60 + seconds.value + additionalSeconds
    if (total < 0) {
      hours.value = 0
      minutes.value = 0
      seconds.value = 0
    } else {
      hours.value = Math.floor(total / 3600)
      const remaining = total % 3600
      minutes.value = Math.floor(remaining / 60)
      seconds.value = remaining % 60
    }
    updateTime()
  }
}

const setPreset = (presetSeconds: number) => {
  if (isRunning.value) return
  hours.value = Math.floor(presetSeconds / 3600)
  const remaining = presetSeconds % 3600
  minutes.value = Math.floor(remaining / 60)
  seconds.value = remaining % 60
  updateTime()
}

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  // Don't handle shortcuts when typing in inputs
  if (e.target instanceof HTMLInputElement) {
    // Allow arrow keys in inputs
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      handleTimeAdjustment(e.key)
    }
    return
  }

  // Space: Start/Pause
  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault()
    if (!isRunning.value && totalSeconds.value > 0) {
      start()
    } else if (isRunning.value && !isPaused.value) {
      pause()
    } else if (isPaused.value) {
      resume()
    }
    return
  }

  // R: Reset
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault()
    reset()
    return
  }

  // Arrow keys: Adjust time
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    handleTimeAdjustment(e.key)
  }
}

const handleTimeAdjustment = (key: string) => {
  if (isRunning.value) return

  switch (key) {
    case 'ArrowUp':
      // Increase seconds
      addTime(1)
      break
    case 'ArrowDown':
      // Decrease seconds
      addTime(-1)
      break
    case 'ArrowRight':
      // Increase minutes
      addTime(60)
      break
    case 'ArrowLeft':
      // Decrease minutes
      addTime(-60)
      break
  }
}

const start = () => {
  const total = hours.value * 3600 + minutes.value * 60 + seconds.value
  if (total === 0) return

  initialSeconds.value = total
  remainingSeconds.value = total
  isRunning.value = true
  isPaused.value = false

  intervalId = window.setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      stop()
      playNotification()
      historyStore.addEntry({
        type: 'timer',
        duration: initialSeconds.value,
      })
      
      // Request notification permission if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
          body: `Your ${formattedTime.value} timer has completed.`,
          icon: '/vite.svg',
        })
      }
    }
  }, 1000)
}

const pause = () => {
  isPaused.value = true
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const resume = () => {
  isPaused.value = false
  intervalId = window.setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      stop()
      playNotification()
      historyStore.addEntry({
        type: 'timer',
        duration: initialSeconds.value,
      })
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
          body: `Your timer has completed.`,
          icon: '/vite.svg',
        })
      }
    }
  }, 1000)
}

const stop = () => {
  isRunning.value = false
  isPaused.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const reset = () => {
  stop()
  hours.value = 0
  minutes.value = 0
  seconds.value = 0
  remainingSeconds.value = 0
  initialSeconds.value = 0
}

const updateSoundSetting = () => {
  settingsStore.setSoundEnabled(soundEnabled.value)
}

const updateSilentSetting = () => {
  settingsStore.setSilentOnTabOpen(silentOnTabOpen.value)
}

onMounted(() => {
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
  
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  window.removeEventListener('keydown', handleKeyDown)
})

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

// Expose methods for parent component
defineExpose({
  formattedTime,
  isRunning,
  isPaused,
  totalSeconds,
})
</script>

