import { createSessionToken, validateSessionToken } from '../session'

describe('session', () => {
  const secret = 'test-admin-secret'

  describe('createSessionToken', () => {
    it('returns a token in uuid.hmac format', async () => {
      const token = await createSessionToken(secret)
      expect(token).toMatch(/^[a-f0-9-]+\.[a-f0-9]+$/)
    })

    it('produces different tokens each time', async () => {
      const t1 = await createSessionToken(secret)
      const t2 = await createSessionToken(secret)
      expect(t1).not.toBe(t2)
    })

    it('works with different secrets', async () => {
      const t1 = await createSessionToken('secret-a')
      const t2 = await createSessionToken('secret-b')
      expect(t1).not.toBe(t2)
    })
  })

  describe('validateSessionToken', () => {
    it('returns true for a valid token', async () => {
      const token = await createSessionToken(secret)
      expect(await validateSessionToken(token, secret)).toBe(true)
    })

    it('returns false for a token signed with a different secret', async () => {
      const token = await createSessionToken(secret)
      expect(await validateSessionToken(token, 'wrong-secret')).toBe(false)
    })

    it('returns false for a malformed token', async () => {
      expect(await validateSessionToken('invalid', secret)).toBe(false)
    })

    it('returns false for an empty token', async () => {
      expect(await validateSessionToken('', secret)).toBe(false)
    })

    it('returns false for tampered UUID', async () => {
      const token = await createSessionToken(secret)
      const [uuid, hmac] = token.split('.')
      const tampered = `tampered-${uuid}.${hmac}`
      expect(await validateSessionToken(tampered, secret)).toBe(false)
    })

    it('returns false for tampered HMAC', async () => {
      const token = await createSessionToken(secret)
      const [uuid] = token.split('.')
      const tampered = `${uuid}.tampered`
      expect(await validateSessionToken(tampered, secret)).toBe(false)
    })
  })
})
