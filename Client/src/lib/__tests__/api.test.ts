import type { ProfileRow, ProjectRow, SkillRow, ExperienceRow, EducationRow } from '../database.types'
import { formatProfile, formatProjects, formatSkills, formatExperiences } from '../api'

describe('api formatters', () => {
  describe('formatProfile', () => {
    it('formats profile row with bio paragraphs', () => {
      const row: ProfileRow = {
        id: 1,
        name: 'John',
        title: 'Developer',
        intro: 'Hello',
        description: 'A dev',
        email: 'john@test.com',
        location: 'NYC',
        github: '',
        linkedin: '',
        twitter: '',
        codepen: '',
        bio_paragraphs: 'Line 1\nLine 2',
        tech_list: 'React, Node.js',
        avatar: '',
        resume_url: '',
        created_at: '',
        updated_at: '',
      }
      const result = formatProfile(row)
      expect(result.name).toBe('John')
      expect(result.bioParagraphs).toEqual(['Line 1', 'Line 2'])
      expect(result.techList).toEqual(['React', 'Node.js'])
    })

    it('handles empty bio and tech', () => {
      const row: ProfileRow = {
        id: 1, name: '', title: '', intro: '', description: '',
        email: '', location: '', github: '', linkedin: '', twitter: '',
        codepen: '', bio_paragraphs: '', tech_list: '', avatar: '', resume_url: '',
        created_at: '', updated_at: '',
      }
      const result = formatProfile(row)
      expect(result.bioParagraphs).toEqual([])
      expect(result.techList).toEqual([])
    })
  })

  describe('formatProjects', () => {
    it('formats project rows with tags split', () => {
      const rows: ProjectRow[] = [
        {
          id: 1, title: 'Test', category: 'web', tag: 'featured',
          desc: 'A test', tags: 'React, Node.js', github: '', live: '',
          image: '', diagram_url: '', sort_order: 0, created_at: '', updated_at: '',
        },
      ]
      const result = formatProjects(rows)
      expect(result).toHaveLength(1)
      expect(result[0].tags).toEqual(['React', 'Node.js'])
      expect(result[0].id).toBe('1')
    })
  })

  describe('formatSkills', () => {
    it('groups skills by category', () => {
      const rows: SkillRow[] = [
        { id: 1, category: 'Frontend', name: 'React', value: 80, sort_order: 0, created_at: '' },
        { id: 2, category: 'Frontend', name: 'CSS', value: 90, sort_order: 1, created_at: '' },
        { id: 3, category: 'Backend', name: 'Node', value: 70, sort_order: 2, created_at: '' },
      ]
      const result = formatSkills(rows)
      expect(result).toHaveLength(2)
      const frontend = result.find((s) => s.category === 'Frontend')
      expect(frontend?.items).toHaveLength(2)
    })

    it('uses "General" category when empty', () => {
      const rows: SkillRow[] = [
        { id: 1, category: '', name: 'React', value: 80, sort_order: 0, created_at: '' },
      ]
      const result = formatSkills(rows)
      expect(result[0].category).toBe('General')
    })
  })

  describe('formatExperiences', () => {
    it('formats experience rows', () => {
      const rows: ExperienceRow[] = [
        {
          id: 1, date: '2024', title: 'Dev', company: 'Acme',
          desc: 'Did stuff', sort_order: 0, created_at: '', updated_at: '',
        },
      ]
      const result = formatExperiences(rows)
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Dev')
      expect(result[0].company).toBe('Acme')
    })
  })
})
