import { getSupabase } from './supabase'
import { unstable_cache } from 'next/cache'
import type {
  ProfileRow,
  ProjectRow,
  SkillRow,
  ExperienceRow,
  EducationRow,
  CertificationRow,
  GalleryRow,
  BlogRow,
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
  items: { name: string; value: number; icon: string }[]
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
  const categories: { [key: string]: { name: string; value: number; icon: string }[] } = {}
  data.forEach((item) => {
    const cat = item.category || 'General'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push({ name: item.name || '', value: item.value || 0, icon: item.icon || '' })
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

const getCachedProfile = unstable_cache(
  async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('profile').select('*').limit(1).single()
    if (error) throw error
    return formatProfile(data as ProfileRow)
  },
  ['profile-data'],
  { revalidate: 3600, tags: ['profile'] }
)

export async function fetchProfile(): Promise<Profile> {
  return getCachedProfile()
}

const getCachedProjects = unstable_cache(
  async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return formatProjects(data as ProjectRow[])
  },
  ['projects-list'],
  { revalidate: 3600, tags: ['projects'] }
)

export async function fetchProjects(): Promise<Project[]> {
  return getCachedProjects()
}

const getCachedSkills = unstable_cache(
  async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return formatSkills(data as SkillRow[])
  },
  ['skills-list'],
  { revalidate: 3600, tags: ['skills'] }
)

export async function fetchSkills(): Promise<Skill[]> {
  return getCachedSkills()
}

const getCachedEducation = unstable_cache(
  async () => {
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
  },
  ['education-list'],
  { revalidate: 3600, tags: ['education'] }
)

export async function fetchEducation(): Promise<Education[]> {
  return getCachedEducation()
}

export async function fetchProject(id: string): Promise<Project> {
  const getCachedProject = unstable_cache(
    async (projId: string) => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('projects').select('*').eq('id', projId).single()
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
    },
    [`project-detail-${id}`],
    { revalidate: 3600, tags: ['projects'] }
  )
  return getCachedProject(id)
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

const getCachedCertifications = unstable_cache(
  async () => {
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
  },
  ['certifications-list'],
  { revalidate: 3600, tags: ['certifications'] }
)

export async function fetchCertifications(): Promise<Certification[]> {
  return getCachedCertifications()
}

const getCachedGallery = unstable_cache(
  async () => {
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
  },
  ['gallery-list'],
  { revalidate: 3600, tags: ['gallery'] }
)

export async function fetchGallery(): Promise<GalleryItem[]> {
  return getCachedGallery()
}

const getCachedExperience = unstable_cache(
  async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return formatExperiences(data as ExperienceRow[])
  },
  ['experience-list'],
  { revalidate: 3600, tags: ['experiences'] }
)

export async function fetchExperience(): Promise<Experience[]> {
  return getCachedExperience()
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  tags: string[]
  published: boolean
  read_time: string
  created_at: string
}

const getCachedBlogPosts = unstable_cache(
  async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as BlogRow[]).map((item) => ({
      id: item.id,
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      cover_image: item.cover_image || '',
      tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      published: item.published,
      read_time: item.read_time || '',
      created_at: item.created_at || '',
    }))
  },
  ['blog-posts-list'],
  { revalidate: 3600, tags: ['blogs'] }
)

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  return getCachedBlogPosts()
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const getCachedBlogPost = unstable_cache(
    async (s: string) => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', s)
        .eq('published', true)
        .single()
      if (error) return null
      const item = data as BlogRow
      return {
        id: item.id,
        title: item.title || '',
        slug: item.slug || '',
        excerpt: item.excerpt || '',
        content: item.content || '',
        cover_image: item.cover_image || '',
        tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        published: item.published,
        read_time: item.read_time || '',
        created_at: item.created_at || '',
      }
    },
    [`blog-post-detail-${slug}`],
    { revalidate: 3600, tags: ['blogs'] }
  )
  return getCachedBlogPost(slug)
}
