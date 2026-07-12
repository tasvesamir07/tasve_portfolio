import { checkRateLimit } from '../rate-limit'

describe('rate-limit', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('allows the first request', () => {
    const result = checkRateLimit('test-key', 3, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('blocks after exceeding max attempts', () => {
    const key = 'exceed-key'
    checkRateLimit(key, 2, 60_000)
    checkRateLimit(key, 2, 60_000)
    const result = checkRateLimit(key, 2, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('tracks remaining attempts correctly', () => {
    const key = 'remaining-key'
    const r1 = checkRateLimit(key, 5, 60_000)
    expect(r1.remaining).toBe(4)

    const r2 = checkRateLimit(key, 5, 60_000)
    expect(r2.remaining).toBe(3)
  })

  it('resets after the window expires', () => {
    const key = 'reset-key'
    checkRateLimit(key, 2, 60_000)
    checkRateLimit(key, 2, 60_000)
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(false)

    jest.advanceTimersByTime(60_001)

    const result = checkRateLimit(key, 2, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('treats different keys independently', () => {
    checkRateLimit('key-a', 1, 60_000)
    expect(checkRateLimit('key-a', 1, 60_000).allowed).toBe(false)
    expect(checkRateLimit('key-b', 1, 60_000).allowed).toBe(true)
  })

  it('uses default values when not provided', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('default-key')
    }
    const result = checkRateLimit('default-key')
    expect(result.allowed).toBe(false)
  })
})
