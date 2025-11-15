<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-card rounded-lg p-8 shadow-lg">
      <!-- Circular Stopwatch Display -->
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
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-5xl font-bold mb-2">{{ formattedTime }}</div>
              <div v-if="isRunning" class="text-sm text-muted-foreground">
                Running
              </div>
              <div v-else-if="elapsedTime > 0" class="text-sm text-muted-foreground">
                Stopped
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex gap-4 justify-center mb-6">
        <button
          v-if="!isRunning && elapsedTime === 0"
          @click="start"
          class="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Start
        </button>
        <button
          v-else-if="isRunning"
          @click="stop"
          class="px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
        >
          Stop
        </button>
        <button
          v-else
          @click="resume"
          class="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Resume
        </button>
        <button
          @click="lap"
          :disabled="!isRunning && elapsedTime === 0"
          class="px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lap
        </button>
        <button
          @click="reset"
          :disabled="elapsedTime === 0"
          class="px-8 py-3 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      <!-- Laps -->
      <div v-if="laps.length > 0" class="mt-6">
        <h3 class="font-semibold mb-4">Laps</h3>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="(lap, index) in laps"
            :key="index"
            class="flex justify-between items-center p-3 bg-secondary rounded-lg"
          >
            <span class="font-medium">Lap {{ laps.length - index }}</span>
            <span class="font-mono">{{ formatTime(lap) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHistoryStore } from '../stores/history'

const historyStore = useHistoryStore()

const elapsedTime = ref(0)
const isRunning = ref(false)
const startTime = ref(0)
const pausedTime = ref(0)
const laps = ref<number[]>([])

let intervalId: number | null = null

const formattedTime = computed(() => {
  return formatTime(elapsedTime.value)
})

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const ms = Math.floor((milliseconds % 1000) / 10)

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
}

const start = () => {
  isRunning.value = true
  startTime.value = Date.now() - pausedTime.value
  intervalId = window.setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value
  }, 10)
}

const stop = () => {
  isRunning.value = false
  pausedTime.value = elapsedTime.value
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const resume = () => {
  start()
}

const lap = () => {
  if (laps.value.length === 0) {
    laps.value.push(elapsedTime.value)
  } else {
    const lastLap = laps.value[laps.value.length - 1]
    laps.value.push(elapsedTime.value - lastLap)
  }
}

const reset = () => {
  stop()
  elapsedTime.value = 0
  pausedTime.value = 0
  laps.value = []
  
  if (elapsedTime.value > 0) {
    historyStore.addEntry({
      type: 'stopwatch',
      duration: Math.floor(elapsedTime.value / 1000),
    })
  }
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

