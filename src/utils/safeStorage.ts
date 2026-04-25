export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

export function getStorageItem<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  return safeJsonParse(raw, fallback)
}

export function setStorageItem(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}
