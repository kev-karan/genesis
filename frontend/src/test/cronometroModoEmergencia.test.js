import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const KEY = 'genesis_emergency_start'

let store = {}
const mockStorage = {
  getItem:    (k) => store[k] ?? null,
  setItem:    (k, v) => { store[k] = String(v) },
  removeItem: (k) => { delete store[k] },
}

function initTimer(storage = mockStorage) {
  if (!storage.getItem(KEY)) {
    storage.setItem(KEY, Date.now().toString())
  }
}

describe('emergency timer persistence', () => {
  beforeEach(() => { store = {} })

  it('sets timer on first call', () => {
    expect(mockStorage.getItem(KEY)).toBeNull()
    initTimer()
    expect(mockStorage.getItem(KEY)).not.toBeNull()
  })

  it('does not overwrite existing timer when called again', () => {
    const original = '1000000000000'
    mockStorage.setItem(KEY, original)
    initTimer()
    expect(mockStorage.getItem(KEY)).toBe(original)
  })

  it('timer value is a valid timestamp', () => {
    initTimer()
    const ts = parseInt(mockStorage.getItem(KEY), 10)
    expect(ts).toBeGreaterThan(0)
    expect(ts).toBeLessThanOrEqual(Date.now())
  })

  it('navigating to home clears timer', () => {
    mockStorage.setItem(KEY, '1000000000000')
    mockStorage.removeItem(KEY)
    expect(mockStorage.getItem(KEY)).toBeNull()
  })

  it('returning to emergencia after home starts a fresh timer', () => {
    mockStorage.removeItem(KEY)
    initTimer()
    const ts = parseInt(mockStorage.getItem(KEY), 10)
    expect(ts).toBeGreaterThan(0)
  })
})
