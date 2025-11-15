<template>
  <div class="h-full flex flex-col">
    <div class="bg-card rounded-lg p-4 shadow-sm border border-border/20 flex-1 flex flex-col">
      <!-- Circular Stopwatch Display -->
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
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl font-bold mb-1">{{ formattedTime }}</div>
              <div v-if="isRunning" class="text-xs text-muted-foreground">
                Running
              </div>
              <div v-else-if="elapsedTime > 0" class="text-xs text-muted-foreground">
                Stopped
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex gap-2 justify-center mb-4 flex-wrap">
        <button
          v-if="!isRunning && elapsedTime === 0"
          @click="start"
          class="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Start
        </button>
        <button
          v-else-if="isRunning"
          @click="stop"
          class="px-6 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Stop
        </button>
        <button
          v-else
          @click="resume"
          class="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Resume
        </button>
        <button
          @click="lap"
          :disabled="!isRunning && elapsedTime === 0"
          class="px-6 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lap
        </button>
        <button
          @click="reset"
          :disabled="elapsedTime === 0"
          class="px-6 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      <!-- Laps -->
      <div v-if="laps.length > 0" class="flex-1 overflow-auto">
        <h3 class="text-xs font-semibold mb-2 text-muted-foreground">Laps</h3>
        <div class="space-y-1.5">
          <div
            v-for="(lap, index) in laps"
            :key="index"
            class="flex justify-between items-center p-2 bg-secondary/50 rounded-md text-sm"
          >
            <span class="font-medium">Lap {{ laps.length - index }}</span>
            <span class="font-mono text-xs">{{ formatTime(lap) }}</span>
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

