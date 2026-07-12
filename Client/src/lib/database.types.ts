export interface ProfileRow {
  id: number
  name: string
  title: string
  intro: string
  description: string
  email: string
  location: string
  github: string
  linkedin: string
  twitter: string
  codepen: string
  bio_paragraphs: string
  tech_list: string
  avatar: string
  resume_url: string
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: number
  title: string
  category: string
  tag: string
  desc: string
  tags: string
  github: string
  live: string
  image: string
  diagram_url: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SkillRow {
  id: number
  category: string
  name: string
  value: number
  sort_order: number
  created_at: string
}

export interface ExperienceRow {
  id: number
  date: string
  title: string
  company: string
  desc: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface EducationRow {
  id: number
  type: string
  title: string
  subtitle: string
  date: string
  details: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ContactRow {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}
