<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-card rounded-lg p-8 shadow-lg">
      <!-- Circular Timer Display -->
      <div class="flex flex-col items-center mb-8">
        <div class="relative w-64 h-64 mb-6">
          <svg class="transform -rotate-90 w-64 h-64">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              class="text-secondary"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              class="text-primary transition-all duration-1000"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              stroke-linecap="round"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-5xl font-bold mb-2">{{ formattedTime }}</div>
              <div v-if="isRunning" class="text-sm text-muted-foreground">
                {{ isPaused ? 'Paused' : 'Running' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Add Buttons -->
        <div class="flex gap-2 mb-6">
          <button
            @click="addTime(10)"
            class="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors font-medium"
          >
            +10s
          </button>
          <button
            @click="addTime(30)"
            class="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors font-medium"
          >
            +30s
          </button>
        </div>
      </div>

      <!-- Time Input Controls -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Hours</label>
          <input
            v-model.number="hours"
            type="number"
            min="0"
            max="23"
            class="w-full px-4 py-2 rounded-lg border border-input bg-background text-center text-2xl font-bold"
            :disabled="isRunning"
            @input="updateTime"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Minutes</label>
          <input
            v-model.number="minutes"
            type="number"
            min="0"
            max="59"
            class="w-full px-4 py-2 rounded-lg border border-input bg-background text-center text-2xl font-bold"
            :disabled="isRunning"
            @input="updateTime"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Seconds</label>
          <input
            v-model.number="seconds"
            type="number"
            min="0"
            max="59"
            class="w-full px-4 py-2 rounded-lg border border-input bg-background text-center text-2xl font-bold"
            :disabled="isRunning"
            @input="updateTime"
          />
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex gap-4 justify-center">
        <button
          v-if="!isRunning"
          @click="start"
          :disabled="totalSeconds === 0"
          class="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start
        </button>
        <button
          v-else-if="isPaused"
          @click="resume"
          class="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Resume
        </button>
        <button
          v-else
          @click="pause"
          class="px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
        >
          Pause
        </button>
        <button
          @click="reset"
          class="px-8 py-3 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Settings -->
    <div class="mt-6 bg-card rounded-lg p-4 shadow">
      <h3 class="font-semibold mb-4">Settings</h3>
      <div class="space-y-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="soundEnabled"
            @change="updateSoundSetting"
            class="w-4 h-4"
          />
          <span>Sound enabled</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="silentOnTabOpen"
            @change="updateSilentSetting"
            class="w-4 h-4"
          />
          <span>Silent when tab is not active</span>
        </label>
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

const circumference = 2 * Math.PI * 120
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
    remainingSeconds.value += additionalSeconds
  } else {
    seconds.value += additionalSeconds
    if (seconds.value >= 60) {
      minutes.value += Math.floor(seconds.value / 60)
      seconds.value = seconds.value % 60
      if (minutes.value >= 60) {
        hours.value += Math.floor(minutes.value / 60)
        minutes.value = minutes.value % 60
      }
    }
    updateTime()
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
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
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
</script>

