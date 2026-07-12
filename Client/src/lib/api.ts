import { getSupabase } from './supabase'
import type {
  ProfileRow,
  ProjectRow,
  SkillRow,
  ExperienceRow,
  EducationRow,
  CertificationRow,
  GalleryRow,
} from './database.types'

export interface Project {
  id: string
  title: string
  category: string
  tag: string
  desc: string
  tags: string[]
  github: string
  live: string
  image: string
  diagram_url: string
}

export interface Profile {
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
  bioParagraphs: string[]
  techList: string[]
  avatar: string
  resume_url: string
  passion: string
  rolesList: string[]
}

export interface Skill {
  category: string
  items: { name: string; value: number }[]
}

export interface Education {
  id: number
  type: string
  title: string
  subtitle: string
  date: string
  details: string
}

export interface Experience {
  date: string
  title: string
  company: string
  desc: string
}

export function formatProfile(data: ProfileRow): Profile {
  return {
    name: data.name || '',
    title: data.title || '',
    intro: data.intro || '',
    description: data.description || '',
    email: data.email || '',
    location: data.location || '',
    github: data.github || '',
    linkedin: data.linkedin || '',
    twitter: data.twitter || '',
    codepen: data.codepen || '',
    bioParagraphs: data.bio_paragraphs ? data.bio_paragraphs.split('\n') : [],
    techList: data.tech_list ? data.tech_list.split(',').map((t: string) => t.trim()) : [],
    avatar: data.avatar || '',
    resume_url: data.resume_url || '',
    passion: data.passion || '',
    rolesList: data.roles_list ? data.roles_list.split(',').map((r: string) => r.trim()).filter(Boolean) : [],
  }
}

export function formatProjects(data: ProjectRow[]): Project[] {
  return data.map((item) => ({
    id: item.id.toString(),
    title: item.title || '',
    category: item.category || '',
    tag: item.tag || '',
    desc: item.desc || '',
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
    github: item.github || '',
    live: item.live || '',
    image: item.image || '',
    diagram_url: item.diagram_url || '',
  }))
}

export function formatSkills(data: SkillRow[]): Skill[] {
  const categories: { [key: string]: { name: string; value: number }[] } = {}
  data.forEach((item) => {
    const cat = item.category || 'General'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push({ name: item.name || '', value: item.value || 0 })
  })
  return Object.keys(categories).map((catName) => ({
    category: catName,
    items: categories[catName],
  }))
}

export function formatExperiences(data: ExperienceRow[]): Experience[] {
  return data.map((item) => ({
    date: item.date || '',
    title: item.title || '',
    company: item.company || '',
    desc: item.desc || '',
  }))
}

export async function fetchProfile(): Promise<Profile> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('profile').select('*').limit(1).single()
  if (error) throw error
  return formatProfile(data as ProfileRow)
}

export async function fetchProjects(): Promise<Project[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return formatProjects(data as ProjectRow[])
}

export async function fetchSkills(): Promise<Skill[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return formatSkills(data as SkillRow[])
}

export async function fetchEducation(): Promise<Education[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data as EducationRow[]).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title || '',
    subtitle: item.subtitle || '',
    date: item.date || '',
    details: item.details || '',
  }))
}

export async function fetchProject(id: string): Promise<Project> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) throw error
  const row = data as ProjectRow
  return {
    id: row.id.toString(),
    title: row.title || '',
    category: row.category || '',
    tag: row.tag || '',
    desc: row.desc || '',
    tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
    github: row.github || '',
    live: row.live || '',
    image: row.image || '',
    diagram_url: row.diagram_url || '',
  }
}

export interface Certification {
  id: number
  title: string
  issuer: string
  date: string
  credential_url: string
  image: string
}

export interface GalleryItem {
  id: number
  title: string
  image: string
  description: string
}

export async function fetchCertifications(): Promise<Certification[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data as CertificationRow[]).map((item) => ({
    id: item.id,
    title: item.title || '',
    issuer: item.issuer || '',
    date: item.date || '',
    credential_url: item.credential_url || '',
    image: item.image || '',
  }))
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data as GalleryRow[]).map((item) => ({
    id: item.id,
    title: item.title || '',
    image: item.image || '',
    description: item.description || '',
  }))
}

export async function fetchExperience(): Promise<Experience[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return formatExperiences(data as ExperienceRow[])
}
