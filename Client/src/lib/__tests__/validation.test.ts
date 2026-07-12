import {
  ProfileSchema,
  ProjectSchema,
  SkillSchema,
  ExperienceSchema,
  EducationSchema,
  CertificationSchema,
  GallerySchema,
  ContactSchema,
  LoginSchema,
} from '../validation'

describe('validation schemas', () => {
  describe('ProfileSchema', () => {
    it('accepts a valid profile', () => {
      const result = ProfileSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        title: 'Developer',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty profile', () => {
      const result = ProfileSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = ProfileSchema.safeParse({ email: 'not-an-email' })
      expect(result.success).toBe(false)
    })

    it('rejects overly long name', () => {
      const result = ProfileSchema.safeParse({ name: 'x'.repeat(201) })
      expect(result.success).toBe(false)
    })
  })

  describe('ProjectSchema', () => {
    it('accepts a minimal project', () => {
      const result = ProjectSchema.safeParse({ title: 'My Project' })
      expect(result.success).toBe(true)
    })

    it('applies defaults for missing fields', () => {
      const result = ProjectSchema.safeParse({ title: 'Test' })
      if (result.success) {
        expect(result.data.category).toBe('')
        expect(result.data.desc).toBe('')
      }
    })

    it('rejects missing title', () => {
      const result = ProjectSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('SkillSchema', () => {
    it('accepts valid skill', () => {
      const result = SkillSchema.safeParse({ category: 'Frontend', name: 'React', value: 80 })
      expect(result.success).toBe(true)
    })

    it('rejects value over 100', () => {
      const result = SkillSchema.safeParse({ category: 'Frontend', name: 'React', value: 150 })
      expect(result.success).toBe(false)
    })

    it('rejects negative value', () => {
      const result = SkillSchema.safeParse({ category: 'Frontend', name: 'React', value: -1 })
      expect(result.success).toBe(false)
    })
  })

  describe('EducationSchema', () => {
    it('accepts valid education', () => {
      const result = EducationSchema.safeParse({
        type: 'education',
        title: 'B.Sc.',
        subtitle: 'University',
      })
      expect(result.success).toBe(true)
    })

    it('defaults type to education', () => {
      const result = EducationSchema.safeParse({ title: 'Test' })
      if (result.success) {
        expect(result.data.type).toBe('education')
      }
    })

    it('rejects invalid type', () => {
      const result = EducationSchema.safeParse({ type: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('CertificationSchema', () => {
    it('accepts valid certification', () => {
      const result = CertificationSchema.safeParse({
        title: 'AWS Certified',
        issuer: 'Amazon',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('GallerySchema', () => {
    it('accepts valid gallery item', () => {
      const result = GallerySchema.safeParse({ title: 'Photo', image: 'https://example.com/img.jpg' })
      expect(result.success).toBe(true)
    })
  })

  describe('ContactSchema', () => {
    it('accepts valid contact', () => {
      const result = ContactSchema.safeParse({
        name: 'John',
        email: 'john@example.com',
        subject: 'Hello',
        message: 'Hi there',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
      const result = ContactSchema.safeParse({
        email: 'john@example.com',
        subject: 'Hello',
        message: 'Hi',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const result = ContactSchema.safeParse({
        name: 'John',
        email: 'bad',
        subject: 'Hello',
        message: 'Hi',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('LoginSchema', () => {
    it('accepts valid login', () => {
      const result = LoginSchema.safeParse({ username: 'admin', password: 'secret' })
      expect(result.success).toBe(true)
    })

    it('rejects empty username', () => {
      const result = LoginSchema.safeParse({ username: '', password: 'secret' })
      expect(result.success).toBe(false)
    })
  })
})
