import { hashPassword, verifyPassword } from '../auth'

describe('auth', () => {
  describe('hashPassword', () => {
    it('returns a salt:derivedKey string', () => {
      const hash = hashPassword('test-password')
      expect(hash).toContain(':')
      const [salt, key] = hash.split(':')
      expect(salt).toHaveLength(32)
      expect(key).toHaveLength(128)
    })

    it('produces different hashes for the same password', () => {
      const h1 = hashPassword('password123')
      const h2 = hashPassword('password123')
      expect(h1).not.toBe(h2)
    })
  })

  describe('verifyPassword', () => {
    it('returns true for matching password', () => {
      const hash = hashPassword('my-secret')
      expect(verifyPassword('my-secret', hash)).toBe(true)
    })

    it('returns false for wrong password', () => {
      const hash = hashPassword('correct')
      expect(verifyPassword('wrong', hash)).toBe(false)
    })

    it('returns false for malformed hash', () => {
      expect(verifyPassword('test', 'invalid')).toBe(false)
    })

    it('returns false for hash with missing parts', () => {
      expect(verifyPassword('test', 'only-salt')).toBe(false)
    })

    it('returns false for empty password against valid hash', () => {
      const hash = hashPassword('something')
      expect(verifyPassword('', hash)).toBe(false)
    })
  })
})
