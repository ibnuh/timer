<template>
  <div class="w-full">
    <div class="p-4">
      <!-- Circular Timer Display -->
      <div class="flex flex-col items-center mb-6">
        <div
          ref="circleContainer"
          class="relative w-64 h-64 mb-6 select-none transition-all duration-200"
          :class="[
            isRunning ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'cursor-grab',
          ]"
          @mousedown="startDrag"
          @touchstart="startDrag"
          @mousemove="handleDrag"
          @touchmove="handleDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @touchend="endDrag"
        >
          <svg class="transform -rotate-90 w-64 h-64 relative z-10">
            <!-- Background circle -->
            <circle
              cx="128"
              cy="128"
              r="116"
              stroke="currentColor"
              stroke-width="6"
              fill="none"
              class="text-secondary/40"
            />
            
            <!-- Progress circle -->
            <circle
              cx="128"
              cy="128"
              r="116"
              stroke="currentColor"
              stroke-width="7"
              fill="none"
              class="text-primary transition-all duration-300"
              :class="[
                rotationDirection === 'clockwise' ? 'text-primary' : rotationDirection === 'counter-clockwise' ? 'text-accent' : '',
                timerFinishedWhileInactive ? 'text-primary' : '',
              ]"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              stroke-linecap="round"
            />
            
            <!-- Rotation indicator dots -->
            <g v-if="isDragging">
              <circle
                v-for="(dot, index) in rotationDots"
                :key="index"
                :cx="128 + Math.cos(dot.angle) * 116"
                :cy="128 + Math.sin(dot.angle) * 116"
                r="3"
                :fill="dot.color"
                :opacity="dot.opacity"
                class="transition-all duration-100"
              />
            </g>
          </svg>
          
          <!-- Center content -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div class="text-center">
              <div
                class="text-5xl font-bold mb-1 transition-colors duration-200"
                :class="[
                  isDragging && rotationDirection === 'clockwise' ? 'text-primary' : '',
                  isDragging && rotationDirection === 'counter-clockwise' ? 'text-accent' : '',
                ]"
              >
                {{ formattedTime }}
              </div>
              <div v-if="isRunning" class="text-xs text-muted-foreground">
                {{ isPaused ? 'Paused' : 'Running' }}
              </div>
              <div
                v-else-if="isDragging"
                class="text-xs font-medium mt-1 transition-colors"
                :class="rotationDirection === 'clockwise' ? 'text-primary' : 'text-accent'"
              >
                {{ rotationDirection === 'clockwise' ? '↻ Adding' : '↺ Subtracting' }}
                <span v-if="rotationSpeed > 1" class="ml-1 opacity-70">
                  ({{ rotationSpeed.toFixed(1) }}x)
                </span>
              </div>
              <div v-else class="text-xs text-muted-foreground mt-1 opacity-60">
                Drag to adjust
              </div>
            </div>
          </div>

          <!-- Timer Finished Indicator Overlay -->
          <div
            v-if="timerFinishedWhileInactive"
            class="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto"
          >
            <div class="bg-background/95 backdrop-blur-sm rounded-full p-6 border-2 border-primary/50 shadow-lg max-w-[90%]">
              <div class="flex flex-col items-center gap-3">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-primary flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span class="text-sm font-semibold text-primary">Timer Finished!</span>
                </div>
                <div class="text-3xl font-bold text-primary">
                  {{ formattedInitialTime }}
                </div>
                <div class="flex gap-2 mt-1">
                  <button
                    @click="repeatTimer"
                    class="px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Repeat
                  </button>
                  <button
                    @click="timerStore.clearFinishedIndicator()"
                    class="px-4 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Quick Add/Subtract Buttons -->
        <div class="flex gap-2 mb-6 flex-wrap justify-center">
          <button
            @click="addTime(-30)"
            class="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
            :disabled="totalSeconds < 30"
          >
            -30s
          </button>
          <button
            @click="addTime(-20)"
            class="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
            :disabled="totalSeconds < 20"
          >
            -20s
          </button>
          <button
            @click="addTime(-10)"
            class="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
            :disabled="totalSeconds < 10"
          >
            -10s
          </button>
          <button
            @click="addTime(10)"
            class="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground border border-border/50"
          >
            +10s
          </button>
          <button
            @click="addTime(20)"
            class="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground border border-border/50"
          >
            +20s
          </button>
          <button
            @click="addTime(30)"
            class="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground border border-border/50"
          >
            +30s
          </button>
        </div>
      </div>

      <!-- Timer Presets -->
      <div class="mb-6">
        <div class="text-sm font-semibold mb-3 text-foreground">Quick Presets</div>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="preset in presets"
            :key="preset.id || preset.label"
            @click="setPreset(preset.seconds)"
            :disabled="isRunning"
            class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Time Input Controls -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <!-- Hours -->
        <div class="flex flex-col">
          <label class="block text-xs font-semibold mb-2 text-foreground/70 uppercase tracking-wide text-center">Hours</label>
          <div class="relative flex flex-col">
            <button
              @click="adjustHours(1)"
              @mousedown.prevent="startRepeat('hours', 1)"
              @mouseup="stopRepeat"
              @mouseleave="stopRepeat"
              @touchstart.prevent="startRepeat('hours', 1)"
              @touchend="stopRepeat"
              :disabled="isRunning || hours >= 23"
              class="flex items-center justify-center h-8 rounded-t-lg bg-secondary hover:bg-secondary/80 active:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-b-0 border-input"
              type="button"
            >
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <input
              v-model.number="hours"
              type="number"
              min="0"
              max="23"
              class="timer-input w-full px-3 py-4 rounded-none border-x-2 border-input bg-background text-center text-3xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isRunning"
              @input="updateTime"
            />
            <button
              @click="adjustHours(-1)"
              @mousedown.prevent="startRepeat('hours', -1)"
              @mouseup="stopRepeat"
              @mouseleave="stopRepeat"
              @touchstart.prevent="startRepeat('hours', -1)"
              @touchend="stopRepeat"
              :disabled="isRunning || hours <= 0"
              class="flex items-center justify-center h-8 rounded-b-lg bg-secondary hover:bg-secondary/80 active:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-t-0 border-input"
              type="button"
            >
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Minutes -->
        <div class="flex flex-col">
          <label class="block text-xs font-semibold mb-2 text-foreground/70 uppercase tracking-wide text-center">Minutes</label>
          <div class="relative flex flex-col">
            <button
              @click="adjustMinutes(1)"
              @mousedown.prevent="startRepeat('minutes', 1)"
              @mouseup="stopRepeat"
              @mouseleave="stopRepeat"
              @touchstart.prevent="startRepeat('minutes', 1)"
              @touchend="stopRepeat"
              :disabled="isRunning || minutes >= 59"
              class="flex items-center justify-center h-8 rounded-t-lg bg-secondary hover:bg-secondary/80 active:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-b-0 border-input"
              type="button"
            >
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <input
              v-model.number="minutes"
              type="number"
              min="0"
              max="59"
              class="timer-input w-full px-3 py-4 rounded-none border-x-2 border-input bg-background text-center text-3xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isRunning"
              @input="updateTime"
            />
            <button
              @click="adjustMinutes(-1)"
              @mousedown.prevent="startRepeat('minutes', -1)"
              @mouseup="stopRepeat"
              @mouseleave="stopRepeat"
              @touchstart.prevent="startRepeat('minutes', -1)"
              @touchend="stopRepeat"
              :disabled="isRunning || minutes <= 0"
              class="flex items-center justify-center h-8 rounded-b-lg bg-secondary hover:bg-secondary/80 active:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-t-0 border-input"
              type="button"
            >
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Seconds -->
        <div class="flex flex-col">
          <label class="block text-xs font-semibold mb-2 text-foreground/70 uppercase tracking-wide text-center">Seconds</label>
          <div class="relative flex flex-col">
            <button
              @click="adjustSeconds(1)"
              @mousedown.prevent="startRepeat('seconds', 1)"
              @mouseup="stopRepeat"
              @mouseleave="stopRepeat"
              @touchstart.prevent="startRepeat('seconds', 1)"
              @touchend="stopRepeat"
              :disabled="isRunning || seconds >= 59"
              class="flex items-center justify-center h-8 rounded-t-lg bg-secondary hover:bg-secondary/80 active:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-b-0 border-input"
              type="button"
            >
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <input
              v-model.number="seconds"
              type="number"
              min="0"
              max="59"
              class="timer-input w-full px-3 py-4 rounded-none border-x-2 border-input bg-background text-center text-3xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isRunning"
              @input="updateTime"
            />
            <button
              @click="adjustSeconds(-1)"
              @mousedown.prevent="startRepeat('seconds', -1)"
              @mouseup="stopRepeat"
              @mouseleave="stopRepeat"
              @touchstart.prevent="startRepeat('seconds', -1)"
              @touchend="stopRepeat"
              :disabled="isRunning || seconds <= 0"
              class="flex items-center justify-center h-8 rounded-b-lg bg-secondary hover:bg-secondary/80 active:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-t-0 border-input"
              type="button"
            >
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex gap-3 justify-center mb-6">
        <button
          v-if="!isRunning"
          @click="start"
          :disabled="totalSeconds === 0"
          class="px-8 py-3 rounded-lg bg-primary text-primary-foreground text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
          class="px-8 py-3 rounded-lg bg-secondary text-secondary-foreground text-base font-medium hover:bg-secondary/80 transition-colors"
        >
          Pause
        </button>
        <button
          @click="reset"
          class="px-8 py-3 rounded-lg bg-destructive text-destructive-foreground text-base font-medium hover:bg-destructive/90 transition-colors"
        >
          Reset
        </button>
      </div>

      <!-- Settings -->
      <div class="pt-4 border-t border-border/60">
        <div class="flex items-center justify-between text-sm mb-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="soundEnabled"
              @change="updateSoundSetting"
              class="w-4 h-4 rounded border-2 border-input checked:bg-primary checked:border-primary"
            />
            <span class="text-foreground font-medium">Sound</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="silentOnTabOpen"
              @change="updateSilentSetting"
              class="w-4 h-4 rounded border-2 border-input checked:bg-primary checked:border-primary"
            />
            <span class="text-foreground font-medium">Silent (tab inactive)</span>
          </label>
        </div>
        <div class="text-xs text-foreground/70 text-center font-medium">
          Space: Start/Pause • R: Reset • Arrows: Adjust time
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useHistoryStore } from '../stores/history'
import { useTimerStore } from '../stores/timer'
import { playNotification } from '../utils/sound'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const timerStore = useTimerStore()

// Use store state
const hours = computed({
  get: () => timerStore.hours,
  set: (val) => timerStore.setTime(val, timerStore.minutes, timerStore.seconds)
})
const minutes = computed({
  get: () => timerStore.minutes,
  set: (val) => timerStore.setTime(timerStore.hours, val, timerStore.seconds)
})
const seconds = computed({
  get: () => timerStore.seconds,
  set: (val) => timerStore.setTime(timerStore.hours, timerStore.minutes, val)
})
const isRunning = computed(() => timerStore.isRunning)
const isPaused = computed(() => timerStore.isPaused)
const remainingSeconds = computed(() => timerStore.remainingSeconds)
const initialSeconds = computed(() => timerStore.initialSeconds)
const timerFinishedWhileInactive = computed(() => timerStore.timerFinishedWhileInactive)

const soundEnabled = ref(settingsStore.settings.soundEnabled)
const silentOnTabOpen = ref(settingsStore.settings.silentOnTabOpen)

let intervalId: number | null = null

// Timer presets - default + custom
const presets = computed(() => {
  const defaultPresets = settingsStore.settings.defaultPresets || []
  const custom = settingsStore.settings.customPresets || []
  return [...defaultPresets, ...custom]
})

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

const formattedInitialTime = computed(() => {
  const h = Math.floor(initialSeconds.value / 3600)
  const m = Math.floor((initialSeconds.value % 3600) / 60)
  const s = initialSeconds.value % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const circumference = 2 * Math.PI * 116

// Circular drag interaction
const circleContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const lastAngle = ref(0)
const lastTime = ref(0)
const rotationSpeed = ref(1)
const consecutiveRotations = ref(0)
const rotationDirection = ref<'clockwise' | 'counter-clockwise' | null>(null)
const currentRotationAngle = ref(0)

const getAngleFromCenter = (x: number, y: number): number => {
  if (!circleContainer.value) return 0
  const rect = circleContainer.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  return Math.atan2(y - centerY, x - centerX)
}

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (isRunning.value) return
  isDragging.value = true
  rotationDirection.value = null
  currentRotationAngle.value = 0
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  lastAngle.value = getAngleFromCenter(clientX, clientY)
  lastTime.value = Date.now()
  consecutiveRotations.value = 0
  rotationSpeed.value = 1
}

const handleDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || isRunning.value) return
  e.preventDefault()
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const currentAngle = getAngleFromCenter(clientX, clientY)
  
  // Calculate angle difference
  let angleDiff = currentAngle - lastAngle.value
  
  // Normalize to -π to π
  if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
  if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
  
  // Determine rotation direction (positive = clockwise, negative = counter-clockwise)
  if (Math.abs(angleDiff) > 0.05) {
    const now = Date.now()
    const timeDiff = now - lastTime.value
    
    // Update rotation direction
    rotationDirection.value = angleDiff > 0 ? 'clockwise' : 'counter-clockwise'
    currentRotationAngle.value += angleDiff
    
    // Speed up if rotating quickly
    if (timeDiff < 50) {
      consecutiveRotations.value++
      rotationSpeed.value = Math.min(5, 1 + consecutiveRotations.value * 0.2)
    } else {
      consecutiveRotations.value = Math.max(0, consecutiveRotations.value - 1)
      rotationSpeed.value = Math.max(1, rotationSpeed.value - 0.1)
    }
    
    // Adjust time: clockwise = add, counter-clockwise = subtract
    const timeAdjustment = Math.round((angleDiff > 0 ? 1 : -1) * 5 * rotationSpeed.value)
    addTime(timeAdjustment)
    
    lastAngle.value = currentAngle
    lastTime.value = now
  }
}

const endDrag = () => {
  isDragging.value = false
  rotationDirection.value = null
  currentRotationAngle.value = 0
  consecutiveRotations.value = 0
  rotationSpeed.value = 1
}

// Rotation indicator dots
const rotationDots = computed(() => {
  if (!isDragging.value || !rotationDirection.value) return []
  const dots = []
  const numDots = Math.min(8, Math.max(4, Math.floor(rotationSpeed.value * 1.5)))
  const baseAngle = currentRotationAngle.value - Math.PI / 2 // Adjust for SVG rotation
  const spacing = (2 * Math.PI) / numDots
  
  for (let i = 0; i < numDots; i++) {
    const angle = baseAngle + i * spacing
    const opacity = 0.4 + (i % 2) * 0.3
    dots.push({
      angle,
      color: rotationDirection.value === 'clockwise' ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
      opacity,
    })
  }
  return dots
})
const strokeDashoffset = computed(() => {
  if (timerFinishedWhileInactive.value) return 0 // Show complete circle when finished
  if (initialSeconds.value === 0) return circumference
  const progress = remainingSeconds.value / initialSeconds.value
  return circumference * (1 - progress)
})

const updateTime = () => {
  let h = hours.value
  let m = minutes.value
  let s = seconds.value
  
  if (h < 0) h = 0
  if (m < 0) m = 0
  if (s < 0) s = 0
  if (m > 59) m = 59
  if (s > 59) s = 59
  if (h > 23) h = 23
  
  timerStore.setTime(h, m, s)
}

const adjustHours = (delta: number) => {
  if (isRunning.value) return
  const newHours = Math.max(0, Math.min(23, hours.value + delta))
  timerStore.setTime(newHours, minutes.value, seconds.value)
}

const adjustMinutes = (delta: number) => {
  if (isRunning.value) return
  const newMinutes = Math.max(0, Math.min(59, minutes.value + delta))
  timerStore.setTime(hours.value, newMinutes, seconds.value)
}

const adjustSeconds = (delta: number) => {
  if (isRunning.value) return
  const newSeconds = Math.max(0, Math.min(59, seconds.value + delta))
  timerStore.setTime(hours.value, minutes.value, newSeconds)
}

// Repeat functionality for hold-to-increase/decrease
let repeatTimeoutId: number | null = null
let repeatIntervalId: number | null = null
let repeatType: 'hours' | 'minutes' | 'seconds' | null = null
let repeatDelta: number = 0

const startRepeat = (type: 'hours' | 'minutes' | 'seconds', delta: number) => {
  if (isRunning.value) return
  
  // Immediately adjust once
  if (type === 'hours') adjustHours(delta)
  else if (type === 'minutes') adjustMinutes(delta)
  else if (type === 'seconds') adjustSeconds(delta)
  
  repeatType = type
  repeatDelta = delta
  
  // Start repeating after initial delay (500ms like default browser behavior)
  repeatTimeoutId = window.setTimeout(() => {
    // Then repeat every 100ms
    repeatIntervalId = window.setInterval(() => {
      if (isRunning.value) {
        stopRepeat()
        return
      }
      
      if (repeatType === 'hours') {
        if ((repeatDelta > 0 && hours.value >= 23) || (repeatDelta < 0 && hours.value <= 0)) {
          stopRepeat()
          return
        }
        adjustHours(repeatDelta)
      } else if (repeatType === 'minutes') {
        if ((repeatDelta > 0 && minutes.value >= 59) || (repeatDelta < 0 && minutes.value <= 0)) {
          stopRepeat()
          return
        }
        adjustMinutes(repeatDelta)
      } else if (repeatType === 'seconds') {
        if ((repeatDelta > 0 && seconds.value >= 59) || (repeatDelta < 0 && seconds.value <= 0)) {
          stopRepeat()
          return
        }
        adjustSeconds(repeatDelta)
      }
    }, 100)
  }, 500)
}

const stopRepeat = () => {
  if (repeatTimeoutId !== null) {
    clearTimeout(repeatTimeoutId)
    repeatTimeoutId = null
  }
  if (repeatIntervalId !== null) {
    clearInterval(repeatIntervalId)
    repeatIntervalId = null
  }
  repeatType = null
  repeatDelta = 0
}

const addTime = (additionalSeconds: number) => {
  timerStore.addTime(additionalSeconds)
  if (isRunning.value && !isPaused.value) {
    timerStore.updateTimeFromRemaining()
  }
}

const setPreset = (presetSeconds: number) => {
  if (isRunning.value) return
  const h = Math.floor(presetSeconds / 3600)
  const remaining = presetSeconds % 3600
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  timerStore.setTime(h, m, s)
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

  stopRepeat() // Stop any ongoing repeat when starting timer
  timerStore.start()
  
  // Start interval to tick the timer
  if (intervalId) clearInterval(intervalId)
  intervalId = window.setInterval(() => {
    const finished = timerStore.tick()
    if (finished) {
      playNotification()
      historyStore.addEntry({
        type: 'timer',
        duration: initialSeconds.value,
      })
      
      // Request notification permission if available
      if (settingsStore.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
          body: `Your timer has completed.`,
          icon: '/vite.svg',
        })
      }
    }
  }, 1000)
}

const pause = () => {
  timerStore.pause()
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const resume = () => {
  timerStore.resume()
  
  // Resume interval
  if (intervalId) clearInterval(intervalId)
  intervalId = window.setInterval(() => {
    const finished = timerStore.tick()
    if (finished) {
      // Timer finished - tick() already set the flag
      playNotification()
      historyStore.addEntry({
        type: 'timer',
        duration: initialSeconds.value,
      })
      
      if (settingsStore.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
          body: `Your timer has completed.`,
          icon: '/vite.svg',
        })
      }
    }
  }, 1000)
}

const stop = () => {
  timerStore.stop()
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const reset = () => {
  stop()
  timerStore.reset()
}

const repeatTimer = () => {
  // Clear the finished indicator
  timerStore.clearFinishedIndicator()
  
  // Restore the time to the initial duration
  const h = Math.floor(initialSeconds.value / 3600)
  const remaining = initialSeconds.value % 3600
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  
  timerStore.setTime(h, m, s)
  
  // Start the timer
  start()
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
  
  // Check if timer finished while inactive (on initial load)
  if (timerStore.timerFinishedWhileInactive) {
    // Timer already finished, indicator will be shown
    // Play notification if enabled
    if (settingsStore.settings.soundEnabled && !settingsStore.settings.silentOnTabOpen) {
      playNotification()
    }
  }
  
  // Restore timer if it was running
  if (timerStore.isRunning && !timerStore.isPaused) {
    // Timer was running, resume the interval
    intervalId = window.setInterval(() => {
      const finished = timerStore.tick()
      if (finished) {
        playNotification()
        historyStore.addEntry({
          type: 'timer',
          duration: initialSeconds.value,
        })
        
        if (settingsStore.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Timer Finished!', {
            body: `Your timer has completed.`,
            icon: '/vite.svg',
          })
        }
      }
    }, 1000)
  } else if (timerStore.isPaused) {
    // Timer was paused, update display
    timerStore.updateTimeFromRemaining()
  }
  
  // Handle page visibility changes
  // Timer continues running in background, but we need to sync when page becomes visible
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Page is visible again - sync timer state
      if (timerStore.isRunning && !timerStore.isPaused) {
        // Ensure interval is running
        if (!intervalId) {
          intervalId = window.setInterval(() => {
            const finished = timerStore.tick()
            if (finished) {
              playNotification()
              historyStore.addEntry({
                type: 'timer',
                duration: initialSeconds.value,
              })
              
              if (settingsStore.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('Timer Finished!', {
                  body: `Your timer has completed.`,
                  icon: '/vite.svg',
                })
              }
            }
          }, 1000)
        }
        // Sync the timer state (recalculate remaining time)
        const finished = timerStore.tick()
        if (finished) {
          // Timer finished - tick() already set the flag if tab was inactive
          playNotification()
          historyStore.addEntry({
            type: 'timer',
            duration: initialSeconds.value,
          })
          
          if (settingsStore.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Finished!', {
              body: `Your timer has completed.`,
              icon: '/vite.svg',
            })
          }
        }
        timerStore.updateTimeFromRemaining()
      } else if (initialSeconds.value > 0) {
        // Timer might have finished while tab was inactive
        // Check the saved state to see if timer expired
        const saved = localStorage.getItem(`timer-state-${timerStore.tabId}`)
        if (saved) {
          try {
            const state = JSON.parse(saved)
            if (state.isRunning && state.startTime && state.initialSeconds) {
              // Timer was running when saved, check if it expired
              const now = Date.now()
              const elapsed = Math.floor((now - state.startTime) / 1000)
              if (elapsed >= state.initialSeconds) {
                // Timer finished while tab was inactive
                timerStore.timerFinishedWhileInactive = true
                timerStore.saveState()
                if (settingsStore.settings.soundEnabled && !settingsStore.settings.silentOnTabOpen) {
                  playNotification()
                }
                historyStore.addEntry({
                  type: 'timer',
                  duration: initialSeconds.value,
                })
                
                if (settingsStore.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                  new Notification('Timer Finished!', {
                    body: `Your timer has completed.`,
                    icon: '/vite.svg',
                  })
                }
              }
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    // When page is hidden, timer continues running in background
    // The tick() function uses timestamps, so it will catch up when page becomes visible
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Store cleanup function
  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    stopRepeat()
    window.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
  
  // Register cleanup
  onUnmounted(cleanup)
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

