import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTimerStore } from './timer'

// Mock localStorage and sessionStorage
const localStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

const sessionStorageMock: Storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

describe('useTimerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('sets time correctly and clamps values', () => {
    const store = useTimerStore()
    store.setTime(5, 30, 45)
    expect(store.hours).toBe(5)
    expect(store.minutes).toBe(30)
    expect(store.seconds).toBe(45)
  })

  it('clamps time values to valid ranges', () => {
    const store = useTimerStore()
    store.setTime(25, 65, -5)
    expect(store.hours).toBe(23)
    expect(store.minutes).toBe(59)
    expect(store.seconds).toBe(0)
  })

  it('starts timer with correct initial state', () => {
    const store = useTimerStore()
    store.setTime(0, 1, 30)
    store.start()

    expect(store.isRunning).toBe(true)
    expect(store.isPaused).toBe(false)
    expect(store.initialSeconds).toBe(90)
    expect(store.remainingSeconds).toBe(90)
    expect(store.startTime).not.toBeNull()
    expect(store.timerFinishedWhileInactive).toBe(false)
  })

  it('does not start when total seconds is zero', () => {
    const store = useTimerStore()
    store.start()

    expect(store.isRunning).toBe(false)
    expect(store.initialSeconds).toBe(0)
  })

  it('tick decrements remaining time', () => {
    const store = useTimerStore()
    store.setTime(0, 1, 0)
    store.start()

    vi.advanceTimersByTime(1000)
    const finished = store.tick()

    expect(finished).toBe(false)
    expect(store.remainingSeconds).toBe(59)
  })

  it('tick returns true when timer finishes', () => {
    const store = useTimerStore()
    store.setTime(0, 0, 2)
    store.start()

    // Simulate 3 seconds elapsed by backdating startTime
    store.startTime = Date.now() - 3000
    const finished = store.tick()

    expect(finished).toBe(true)
    expect(store.isRunning).toBe(false)
    expect(store.remainingSeconds).toBe(0)
    expect(store.timerFinishedWhileInactive).toBe(true)
  })

  it('pause preserves remaining time', () => {
    const store = useTimerStore()
    store.setTime(0, 5, 0)
    store.start()

    vi.advanceTimersByTime(3000)
    store.tick()
    store.pause()

    expect(store.isRunning).toBe(false)
    expect(store.isPaused).toBe(true)
    expect(store.remainingSeconds).toBe(297)
    expect(store.pausedRemaining).toBe(297)
  })

  it('resume continues from paused time', () => {
    const store = useTimerStore()
    store.setTime(0, 5, 0)
    store.start()

    vi.advanceTimersByTime(3000)
    store.tick()
    store.pause()

    const remainingBeforeResume = store.remainingSeconds
    store.resume()

    expect(store.isRunning).toBe(true)
    expect(store.isPaused).toBe(false)
    expect(store.remainingSeconds).toBe(remainingBeforeResume)
  })

  it('adds time while running', () => {
    const store = useTimerStore()
    store.setTime(0, 1, 0)
    store.start()

    store.addTime(30)

    expect(store.remainingSeconds).toBe(90)
    expect(store.initialSeconds).toBe(90)
  })

  it('adds time while stopped', () => {
    const store = useTimerStore()
    store.setTime(0, 1, 0)
    store.addTime(45)

    expect(store.minutes).toBe(1)
    expect(store.seconds).toBe(45)
  })

  it('does not go below zero when subtracting time while stopped', () => {
    const store = useTimerStore()
    store.setTime(0, 0, 10)
    store.addTime(-20)

    expect(store.hours).toBe(0)
    expect(store.minutes).toBe(0)
    expect(store.seconds).toBe(0)
  })

  it('reset clears all state', () => {
    const store = useTimerStore()
    store.setTime(0, 5, 0)
    store.start()
    store.reset()

    expect(store.isRunning).toBe(false)
    expect(store.isPaused).toBe(false)
    expect(store.hours).toBe(0)
    expect(store.minutes).toBe(0)
    expect(store.seconds).toBe(0)
    expect(store.remainingSeconds).toBe(0)
    expect(store.initialSeconds).toBe(0)
    expect(store.label).toBe('')
  })

  it('sets and trims label', () => {
    const store = useTimerStore()
    store.setLabel('  My Timer  ')
    expect(store.label).toBe('My Timer')
  })

  it('updateTimeFromRemaining splits seconds into h/m/s', () => {
    const store = useTimerStore()
    store.remainingSeconds = 3665
    store.updateTimeFromRemaining()

    expect(store.hours).toBe(1)
    expect(store.minutes).toBe(1)
    expect(store.seconds).toBe(5)
  })

  it('clearFinishedIndicator resets flag', () => {
    const store = useTimerStore()
    store.timerFinishedWhileInactive = true
    store.clearFinishedIndicator()
    expect(store.timerFinishedWhileInactive).toBe(false)
  })
})
