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
  passion: string
  roles_list: string
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
  icon: string
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

export interface AdminRow {
  id: number
  username: string
  password_hash: string
  display_name: string
  email: string
  created_at: string
  updated_at: string
}

export interface OTPCodeRow {
  id: number
  admin_id: number
  code: string
  expires_at: string
  used: boolean
  created_at: string
}

export interface CertificationRow {
  id: number
  title: string
  issuer: string
  date: string
  credential_url: string
  image: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface GalleryRow {
  id: number
  title: string
  image: string
  description: string
  sort_order: number
  created_at: string
}

export interface BlogRow {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  tags: string
  published: boolean
  read_time: string
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
