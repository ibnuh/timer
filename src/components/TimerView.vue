<template>
  <div class="w-full">
    <div class="p-2">
      <!-- Circular Timer Display -->
      <div class="flex flex-col items-center mb-4">
        <div
          ref="circleContainer"
          class="relative w-64 h-64 mb-4 select-none transition-all duration-200"
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
              :stroke-dasharray="CIRCUMFERENCE"
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
                v-if="label && (isRunning || isPaused)"
                class="text-sm font-medium text-foreground/80 mb-2 px-3 py-1 rounded-md bg-secondary/50 max-w-[200px] mx-auto truncate"
              >
                {{ label }}
              </div>
              <div
                class="text-5xl font-bold mb-1 transition-colors duration-200"
                :class="[
                  isDragging && rotationDirection === 'clockwise' ? 'text-primary' : '',
                  isDragging && rotationDirection === 'counter-clockwise' ? 'text-accent' : '',
                ]"
              >
                {{ displayTime }}
              </div>
              <div v-if="isRunning" class="text-xs text-muted-foreground">
                {{ isPaused ? 'Paused' : 'Running' }}
              </div>
              <div
                v-else-if="isDragging"
                class="text-xs font-medium mt-1 transition-colors"
                :class="rotationDirection === 'clockwise' ? 'text-primary' : 'text-accent'"
              >
                {{ rotationDirection === 'clockwise' ? 'Adding' : 'Subtracting' }}
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
            <div class="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-full"></div>
            <div class="relative z-10 flex flex-col items-center gap-3">
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
              <div v-if="finishedAtTime" class="text-xs text-muted-foreground">
                Finished at {{ finishedAtTime }}
              </div>
              <div v-if="label" class="text-sm font-medium text-foreground/80 px-3 py-1 rounded-md bg-secondary/50 max-w-[200px] truncate">
                {{ label }}
              </div>
              <div class="text-3xl font-bold text-primary">
                {{ formatDuration(initialSeconds) }}
              </div>
              <div class="flex gap-2 mt-1 flex-col">
                <button
                  @click="repeatTimer"
                  class="px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Repeat
                </button>
                <button
                  @click="dismissFinished"
                  class="px-4 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Add/Subtract Buttons -->
        <div class="flex gap-2 mb-4 flex-wrap justify-center">
          <button
            @click="addTime(-30)"
            class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
            :disabled="totalSeconds < 30"
          >
            -30s
          </button>
          <button
            @click="addTime(-10)"
            class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
            :disabled="totalSeconds < 10"
          >
            -10s
          </button>
          <button
            @click="addTime(10)"
            class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground border border-border/50"
          >
            +10s
          </button>
          <button
            @click="addTime(30)"
            class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground border border-border/50"
          >
            +30s
          </button>
          <button
            @click="addTime(60)"
            class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground border border-border/50"
          >
            +1m
          </button>
          <button
            @click="addTime(300)"
            class="px-3 py-2 rounded-md bg-secondary hover:bg-secondary/90 transition-colors text-sm font-medium text-secondary-foreground border border-border/50"
          >
            +5m
          </button>
        </div>
      </div>

      <!-- Label Input -->
      <div class="mb-3">
        <label class="block text-sm font-semibold mb-1.5 text-foreground">Label</label>
        <div class="relative">
          <input
            v-model="timerLabel"
            @input="updateLabel"
            @blur="updateLabel"
            type="text"
            placeholder="Add a label"
            maxlength="50"
            :disabled="isRunning"
            class="w-full px-4 py-2 pr-10 rounded-md bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            v-if="timerLabel"
            @click="clearLabel"
            type="button"
            :disabled="isRunning"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear label"
          >
            <svg
              class="w-4 h-4 text-foreground/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Timer Presets -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-foreground">Quick Presets</div>
          <button
            @click="copyShareLink"
            class="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            :disabled="totalSeconds === 0"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy link
          </button>
        </div>
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
      <div class="grid grid-cols-3 gap-3 mb-3">
        <!-- Hours -->
        <div class="flex flex-col">
          <label class="block text-xs font-semibold mb-1.5 text-foreground/70 uppercase tracking-wide text-center">Hours</label>
          <div class="relative flex flex-col">
            <button
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
          <label class="block text-xs font-semibold mb-1.5 text-foreground/70 uppercase tracking-wide text-center">Minutes</label>
          <div class="relative flex flex-col">
            <button
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
          <label class="block text-xs font-semibold mb-1.5 text-foreground/70 uppercase tracking-wide text-center">Seconds</label>
          <div class="relative flex flex-col">
            <button
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
      <div class="flex gap-3 justify-center mb-3">
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
      <div class="pt-3 border-t border-border/60">
        <div class="flex items-center justify-between flex-wrap gap-2 text-sm mb-2">
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
            <span class="text-foreground font-medium">Silent when tab is not active</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="repeatBells"
              @change="updateRepeatBellsSetting"
              class="w-4 h-4 rounded border-2 border-input checked:bg-primary checked:border-primary"
            />
            <span class="text-foreground font-medium">Repeat bells</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Accessibility: live region for screen readers -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ ariaLiveMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useHistoryStore } from '../stores/history'
import { useTimerStore } from '../stores/timer'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'
import { playNotification, stopRepeatingBells } from '../utils/sound'
import { formatDuration, formatTimeOnly } from '../utils/timeFormatter'
import { CIRCUMFERENCE, REPEAT_BUTTON_DELAY_MS, REPEAT_BUTTON_INTERVAL_MS } from '../utils/constants'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const timerStore = useTimerStore()

const circleContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const lastAngle = ref(0)
const lastTime = ref(0)
const rotationSpeed = ref(1)
const consecutiveRotations = ref(0)
const rotationDirection = ref<'clockwise' | 'counter-clockwise' | null>(null)
const currentRotationAngle = ref(0)
const finishedAtTime = ref<string>('')
const ariaLiveMessage = ref<string>('')

const hours = computed({
  get: () => timerStore.hours,
  set: (val: number) => timerStore.setTime(val, timerStore.minutes, timerStore.seconds)
})
const minutes = computed({
  get: () => timerStore.minutes,
  set: (val: number) => timerStore.setTime(timerStore.hours, val, timerStore.seconds)
})
const seconds = computed({
  get: () => timerStore.seconds,
  set: (val: number) => timerStore.setTime(timerStore.hours, timerStore.minutes, val)
})
const isRunning = computed(() => timerStore.isRunning)
const isPaused = computed(() => timerStore.isPaused)
const remainingSeconds = computed(() => timerStore.remainingSeconds)
const initialSeconds = computed(() => timerStore.initialSeconds)
const timerFinishedWhileInactive = computed(() => timerStore.timerFinishedWhileInactive)
const label = computed(() => timerStore.label)
const timerLabel = ref(timerStore.label || '')

const soundEnabled = ref(settingsStore.settings.soundEnabled)
const silentOnTabOpen = ref(settingsStore.settings.silentOnTabOpen)
const repeatBells = ref(settingsStore.settings.repeatBells)

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

const displayTime = computed(() => formatDuration(totalSeconds.value))

const strokeDashoffset = computed(() => {
  if (timerFinishedWhileInactive.value) {
    return 0
  }
  if (initialSeconds.value === 0) {
    return CIRCUMFERENCE
  }
  const progress = remainingSeconds.value / initialSeconds.value
  return CIRCUMFERENCE * (1 - progress)
})

// Circular drag interaction
const getAngleFromCenter = (x: number, y: number): number => {
  if (!circleContainer.value) {
    return 0
  }
  const rect = circleContainer.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  return Math.atan2(y - centerY, x - centerX)
}

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (isRunning.value) {
    return
  }
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
  if (!isDragging.value || isRunning.value) {
    return
  }
  e.preventDefault()

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const currentAngle = getAngleFromCenter(clientX, clientY)

  let angleDiff = currentAngle - lastAngle.value

  if (angleDiff > Math.PI) {
    angleDiff -= 2 * Math.PI
  }
  if (angleDiff < -Math.PI) {
    angleDiff += 2 * Math.PI
  }

  if (Math.abs(angleDiff) > 0.05) {
    const now = Date.now()
    const timeDiff = now - lastTime.value

    rotationDirection.value = angleDiff > 0 ? 'clockwise' : 'counter-clockwise'
    currentRotationAngle.value += angleDiff

    if (timeDiff < 50) {
      consecutiveRotations.value++
      rotationSpeed.value = Math.min(5, 1 + consecutiveRotations.value * 0.2)
    } else {
      consecutiveRotations.value = Math.max(0, consecutiveRotations.value - 1)
      rotationSpeed.value = Math.max(1, rotationSpeed.value - 0.1)
    }

    const baseStep = rotationSpeed.value > 2 ? 5 : 1
    const timeAdjustment = Math.round((angleDiff > 0 ? 1 : -1) * baseStep * rotationSpeed.value)
    addTime(timeAdjustment)

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

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

const rotationDots = computed(() => {
  if (!isDragging.value || !rotationDirection.value) {
    return []
  }
  const dots = []
  const numDots = Math.min(8, Math.max(4, Math.floor(rotationSpeed.value * 1.5)))
  const baseAngle = currentRotationAngle.value - Math.PI / 2
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

const updateTime = () => {
  let h = hours.value
  let m = minutes.value
  let s = seconds.value

  if (h < 0) {
    h = 0
  }
  if (m < 0) {
    m = 0
  }
  if (s < 0) {
    s = 0
  }
  if (m > 59) {
    m = 59
  }
  if (s > 59) {
    s = 59
  }
  if (h > 23) {
    h = 23
  }

  timerStore.setTime(h, m, s)
}

// Repeat functionality for hold-to-increase/decrease
let repeatTimeoutId: number | null = null
let repeatIntervalId: number | null = null
let repeatType: 'hours' | 'minutes' | 'seconds' | null = null
let repeatDelta = 0

const startRepeat = (type: 'hours' | 'minutes' | 'seconds', delta: number) => {
  if (isRunning.value) {
    return
  }

  if (type === 'hours') {
    adjustHours(delta)
  } else if (type === 'minutes') {
    adjustMinutes(delta)
  } else if (type === 'seconds') {
    adjustSeconds(delta)
  }

  repeatType = type
  repeatDelta = delta

  repeatTimeoutId = window.setTimeout(() => {
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
    }, REPEAT_BUTTON_INTERVAL_MS)
  }, REPEAT_BUTTON_DELAY_MS)
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

const adjustHours = (delta: number) => {
  if (isRunning.value) {
    return
  }
  const newHours = Math.max(0, Math.min(23, hours.value + delta))
  timerStore.setTime(newHours, minutes.value, seconds.value)
}

const adjustMinutes = (delta: number) => {
  if (isRunning.value) {
    return
  }
  const newMinutes = Math.max(0, Math.min(59, minutes.value + delta))
  timerStore.setTime(hours.value, newMinutes, seconds.value)
}

const adjustSeconds = (delta: number) => {
  if (isRunning.value) {
    return
  }
  const newSeconds = Math.max(0, Math.min(59, seconds.value + delta))
  timerStore.setTime(hours.value, minutes.value, newSeconds)
}

const addTime = (additionalSeconds: number) => {
  timerStore.addTime(additionalSeconds)
  if (isRunning.value && !isPaused.value) {
    timerStore.updateTimeFromRemaining()
  }
}

const setPreset = (presetSeconds: number) => {
  if (isRunning.value) {
    return
  }
  const h = Math.floor(presetSeconds / 3600)
  const remaining = presetSeconds % 3600
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  timerStore.setTime(h, m, s)
}

// Browser notification helpers
const showBrowserNotification = () => {
  if (!settingsStore.settings.notificationsEnabled) {
    return
  }
  if (!('Notification' in window)) {
    return
  }
  if (Notification.permission === 'denied') {
    return
  }
  if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        createNotification()
      }
    })
    return
  }
  if (Notification.permission === 'granted') {
    createNotification()
  }
}

const createNotification = () => {
  try {
    const notification = new Notification('Timer Finished!', {
      body: 'Your timer has completed.',
      icon: '/vite.svg',
      tag: 'timer-finished',
    })
    setTimeout(() => {
      notification.close()
    }, 5000)
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

// Timer controls
const start = () => {
  const total = hours.value * 3600 + minutes.value * 60 + seconds.value
  if (total === 0) {
    return
  }

  stopRepeat()
  stopRepeatingBells()
  timerStore.start()

  historyStore.addEntry({
    type: 'timer',
    status: 'started',
    duration: initialSeconds.value,
    label: label.value || undefined,
  })
}

const pause = () => {
  timerStore.pause()
}

const resume = () => {
  timerStore.resume()
}

const stop = () => {
  timerStore.stop()
}

const reset = () => {
  stop()
  stopRepeatingBells()
  timerStore.reset()
}

const dismissFinished = () => {
  stopRepeatingBells()
  timerStore.clearFinishedIndicator()
  finishedAtTime.value = ''
}

const repeatTimer = () => {
  stopRepeatingBells()
  timerStore.clearFinishedIndicator()
  finishedAtTime.value = ''

  const h = Math.floor(initialSeconds.value / 3600)
  const remaining = initialSeconds.value % 3600
  const m = Math.floor(remaining / 60)
  const s = remaining % 60

  timerStore.setTime(h, m, s)
  start()
}

const updateSoundSetting = () => {
  settingsStore.setSoundEnabled(soundEnabled.value)
}

const updateSilentSetting = () => {
  settingsStore.setSilentOnTabOpen(silentOnTabOpen.value)
}

const updateRepeatBellsSetting = () => {
  settingsStore.setRepeatBells(repeatBells.value)
}

const updateLabel = () => {
  timerStore.setLabel(timerLabel.value)
}

const clearLabel = () => {
  timerLabel.value = ''
  timerStore.setLabel('')
}

const copyShareLink = async () => {
  const total = isRunning.value ? initialSeconds.value : totalSeconds.value
  const params = new URLSearchParams()
  params.set('t', String(total))
  if (label.value) {
    params.set('label', label.value)
  }
  const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
  try {
    await navigator.clipboard.writeText(url)
    ariaLiveMessage.value = 'Timer link copied to clipboard'
    setTimeout(() => {
      ariaLiveMessage.value = ''
    }, 2000)
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = url
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ariaLiveMessage.value = 'Timer link copied to clipboard'
    setTimeout(() => {
      ariaLiveMessage.value = ''
    }, 2000)
  }
}

// Keyboard shortcuts
useKeyboardShortcuts(
  {
    start,
    pause,
    resume,
    reset,
    repeat: repeatTimer,
    dismiss: dismissFinished,
    addTime,
  },
  () => ({
    isRunning: isRunning.value,
    isPaused: isPaused.value,
    totalSeconds: totalSeconds.value,
    timerFinishedWhileInactive: timerFinishedWhileInactive.value,
  })
)

// Watch for timer finish
watch(
  () => timerStore.timerFinishedWhileInactive,
  (finished) => {
    if (finished) {
      playNotification()
      finishedAtTime.value = formatTimeOnly(new Date())
      historyStore.addEntry({
        type: 'timer',
        status: 'completed',
        duration: initialSeconds.value,
        label: label.value || undefined,
        finishedAt: Date.now(),
      })
      showBrowserNotification()
      ariaLiveMessage.value = `Timer finished. ${label.value || 'Timer'} completed.`
    }
  }
)

// Watch for label changes from store
watch(
  () => timerStore.label,
  (newLabel) => {
    timerLabel.value = newLabel || ''
  }
)

// Watch settings
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

watch(
  () => settingsStore.settings.repeatBells,
  (val) => {
    repeatBells.value = val
  }
)

const handleVisibilityChange = () => {
  if (!document.hidden && timerStore.isRunning && !timerStore.isPaused) {
    timerStore.tick()
    timerStore.updateTimeFromRemaining()
  }
}

onMounted(() => {
  timerLabel.value = timerStore.label || ''

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }

  // Parse URL params
  const params = new URLSearchParams(window.location.search)
  const t = params.get('t')
  const labelParam = params.get('label')
  if (t) {
    const parsed = parseInt(t, 10)
    if (!isNaN(parsed) && parsed > 0) {
      const h = Math.floor(parsed / 3600)
      const remaining = parsed % 3600
      const m = Math.floor(remaining / 60)
      const s = remaining % 60
      timerStore.setTime(h, m, s)
    }
  }
  if (labelParam) {
    timerStore.setLabel(labelParam)
    timerLabel.value = labelParam
  }

  // Check if timer finished while tab was inactive on mount
  if (timerStore.timerFinishedWhileInactive) {
    if (settingsStore.settings.soundEnabled && !settingsStore.settings.silentOnTabOpen) {
      playNotification()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopRepeat()
  stopRepeatingBells()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// Expose for parent
defineExpose({
  formattedTime: displayTime,
  isRunning,
  isPaused,
  totalSeconds,
})
</script>
