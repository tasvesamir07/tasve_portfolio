import { getSupabase } from './supabase'

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
}

export interface Skill {
  category: string
  items: { name: string; value: number }[]
}

export interface Experience {
  date: string
  title: string
  company: string
  desc: string
}

function formatProfile(data: any): Profile {
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
  }
}

function formatProjects(data: any[]): Project[] {
  return data.map((item: any) => ({
    id: item.id.toString(),
    title: item.title || '',
    category: item.category || '',
    tag: item.tag || '',
    desc: item.desc || '',
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
    github: item.github || '',
    live: item.live || '',
    image: item.image || '',
  }))
}

function formatSkills(data: any[]): Skill[] {
  const categories: { [key: string]: { name: string; value: number }[] } = {}
  data.forEach((item: any) => {
    const cat = item.category || 'General'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push({ name: item.name || '', value: item.value || 0 })
  })
  return Object.keys(categories).map((catName) => ({
    category: catName,
    items: categories[catName],
  }))
}

function formatExperiences(data: any[]): Experience[] {
  return data
    .map((item: any) => ({
      date: item.date || '',
      title: item.title || '',
      company: item.company || '',
      desc: item.desc || '',
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function fetchProfile(): Promise<Profile> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('profile').select('*').limit(1).single()
  if (error) throw error
  return formatProfile(data)
}

export async function fetchProjects(): Promise<Project[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return formatProjects(data)
}

export async function fetchSkills(): Promise<Skill[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('skills').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return formatSkills(data)
}

export async function fetchExperience(): Promise<Experience[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('experiences').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return formatExperiences(data)
}
