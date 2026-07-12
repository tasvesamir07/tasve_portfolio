import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':')
  if (!salt || !key) return false
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  try {
    return timingSafeEqual(Buffer.from(derivedKey), Buffer.from(key))
  } catch {
    return false
  }
}
