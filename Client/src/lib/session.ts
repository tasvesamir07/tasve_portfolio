import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto'

export function createSessionToken(password: string): string {
  const uuid = randomUUID()
  const hmac = createHmac('sha256', password).update(uuid).digest('hex')
  return `${uuid}.${hmac}`
}

export function validateSessionToken(token: string, password: string): boolean {
  const [uuid, hmac] = token.split('.')
  if (!uuid || !hmac) return false
  const expected = createHmac('sha256', password).update(uuid).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))
  } catch {
    return false
  }
}
