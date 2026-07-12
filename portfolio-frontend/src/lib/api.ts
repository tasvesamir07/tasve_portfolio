import { supabase } from './supabase'

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
  if (!data) return FALLBACK_PROFILE
  return {
    name: data.name || FALLBACK_PROFILE.name,
    title: data.title || FALLBACK_PROFILE.title,
    intro: data.intro || FALLBACK_PROFILE.intro,
    description: data.description || FALLBACK_PROFILE.description,
    email: data.email || FALLBACK_PROFILE.email,
    location: data.location || FALLBACK_PROFILE.location,
    github: data.github || FALLBACK_PROFILE.github,
    linkedin: data.linkedin || FALLBACK_PROFILE.linkedin,
    twitter: data.twitter || FALLBACK_PROFILE.twitter,
    codepen: data.codepen || FALLBACK_PROFILE.codepen,
    bioParagraphs: data.bio_paragraphs ? data.bio_paragraphs.split('\n') : FALLBACK_PROFILE.bioParagraphs,
    techList: data.tech_list ? data.tech_list.split(',').map((t: string) => t.trim()) : FALLBACK_PROFILE.techList,
  }
}

function formatProjects(data: any[]): Project[] {
  if (!data || data.length === 0) return FALLBACK_PROJECTS
  return data.map((item: any) => ({
    id: item.id.toString(),
    title: item.title,
    category: item.category || 'frontend',
    tag: item.tag || '',
    desc: item.desc,
    tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
    github: item.github || '#',
    live: item.live || '#',
    image: item.image || '',
  }))
}

function formatSkills(data: any[]): Skill[] {
  if (!data || data.length === 0) return FALLBACK_SKILLS
  const categories: { [key: string]: { name: string; value: number }[] } = {}
  data.forEach((item: any) => {
    const cat = item.category || 'General'
    if (!categories[cat]) categories[cat] = []
    categories[cat].push({ name: item.name, value: item.value || 0 })
  })
  return Object.keys(categories).map((catName) => ({
    category: catName,
    items: categories[catName],
  }))
}

function formatExperiences(data: any[]): Experience[] {
  if (!data || data.length === 0) return FALLBACK_EXPERIENCE
  return data
    .map((item: any) => ({
      date: item.date,
      title: item.title,
      company: item.company,
      desc: item.desc,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function fetchProfile(): Promise<Profile> {
  try {
    const { data, error } = await supabase.from('profile').select('*').limit(1).single()
    if (error) throw error
    return formatProfile(data)
  } catch (err) {
    console.warn('DB offline or profile not configured. Loading local fallback data...', err)
    return FALLBACK_PROFILE
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    return formatProjects(data)
  } catch (err) {
    console.warn('DB offline or projects not configured. Loading local fallback data...', err)
    return FALLBACK_PROJECTS
  }
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const { data, error } = await supabase.from('skills').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    return formatSkills(data)
  } catch (err) {
    console.warn('DB offline or skills not configured. Loading local fallback data...', err)
    return FALLBACK_SKILLS
  }
}

export async function fetchExperience(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase.from('experiences').select('*').order('sort_order', { ascending: true })
    if (error) throw error
    return formatExperiences(data)
  } catch (err) {
    console.warn('DB offline or experience not configured. Loading local fallback data...', err)
    return FALLBACK_EXPERIENCE
  }
}

const FALLBACK_PROFILE: Profile = {
  name: 'Samir Anik',
  title: 'Full Stack Engineer',
  intro: "Hello World, I'm",
  description: 'I build highly interactive, responsive, and visually stunning digital products that bridge the gap between complex backend architectures and high-end frontend user experiences.',
  email: 'samir.anik.dev@gmail.com',
  location: 'Dhaka, Bangladesh',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://twitter.com',
  codepen: 'https://codepen.io',
  bioParagraphs: [
    "Hello! I'm Samir, a software engineer with a deep passion for designing interfaces that feel alive. My journey into coding began out of curiosity about how complex animations on top-tier websites were crafted, which quickly evolved into a full-blown obsession with modern web performance and engineering.",
    'Today, I specialize in crafting robust web architectures, writing optimized, responsive interfaces, and developing clean APIs. I thrive at the intersection of developer experience, animation details, and clean software architecture.',
  ],
  techList: [
    'JavaScript (ES6+)',
    'React & Next.js',
    'Node.js & Express',
    'Python & Flask',
    'PostgreSQL / Spanner',
    'GCP (Cloud Storage/BigQuery)',
  ],
}

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: 'Aetherial AI',
    category: 'ai',
    tag: 'AI Powered',
    desc: 'An interactive creative workspace integration powered by Gemini. Resolves real-time UI/UX mockups, styles, and codes layouts dynamically with live visual rendering.',
    tags: ['React', 'Next.js', 'Node.js', 'Gemini API'],
    github: 'https://github.com',
    live: 'https://github.com',
    image: '',
  },
  {
    id: 'project-2',
    title: 'NovaStream',
    category: 'fullstack',
    tag: 'Data Analytics',
    desc: 'A real-time data streaming and analytics pipeline handling ingestion telemetry, dashboard rendering, and alerts with latency under 15ms.',
    tags: ['Next.js', 'Redis', 'Spanner', 'ChartJS'],
    github: 'https://github.com',
    live: 'https://github.com',
    image: '',
  },
  {
    id: 'project-3',
    title: 'Crypta Vault',
    category: 'frontend',
    tag: 'Security',
    desc: 'A localized, offline-first encrypted password and credentials manager. Uses AES-256 GCM in the browser, featuring premium dynamic charts and glassmorphism.',
    tags: ['TypeScript', 'Web Crypto', 'Tailwind CSS', 'HTML5'],
    github: 'https://github.com',
    live: 'https://github.com',
    image: '',
  },
]

const FALLBACK_SKILLS: Skill[] = [
  {
    category: 'Frontend Development',
    items: [
      { name: 'HTML5 / CSS3 / ES6+', value: 95 },
      { name: 'React.js / Next.js', value: 90 },
      { name: 'TypeScript', value: 85 },
      { name: 'Animation CSS / Framer / WebGL', value: 88 },
    ],
  },
  {
    category: 'Backend & Database',
    items: [
      { name: 'Node.js / Express', value: 92 },
      { name: 'Python / Flask / Django', value: 80 },
      { name: 'SQL (PostgreSQL, Spanner)', value: 85 },
      { name: 'REST APIs & GraphQL', value: 90 },
    ],
  },
  {
    category: 'Cloud & Workflows',
    items: [
      { name: 'GCP / Cloud Storage / Cloud Run', value: 85 },
      { name: 'Docker / Containers', value: 80 },
      { name: 'Git / GitHub CI/CD', value: 90 },
      { name: 'Figma / UI Design', value: 85 },
    ],
  },
]

const FALLBACK_EXPERIENCE: Experience[] = [
  {
    date: '2024 - Present',
    title: 'Lead Full-Stack Developer',
    company: 'Nexus Tech Solutions',
    desc: 'Orchestrated architectural design and development of cloud-native web portals. Mentored 4 junior developers and implemented CI/CD pipelines reducing deployment times by 35%.',
  },
  {
    date: '2022 - 2024',
    title: 'Software Engineer',
    company: 'Prism Creative Studios',
    desc: 'Built interactive websites and dashboards using React, Node.js, and CSS animations. Improved SEO scores from 72 to 100 on primary landing pages.',
  },
  {
    date: '2020 - 2022',
    title: 'Frontend Developer Associate',
    company: 'Hyperion Labs',
    desc: 'Handled interface development, component layouts, and cross-browser testing. Built custom CSS animation micro-libraries for product marketing pages.',
  },
]
