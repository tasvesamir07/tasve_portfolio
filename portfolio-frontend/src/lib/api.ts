/* ==========================================================================
   NEXT.JS STRAPI API ADAPTER & STATIC FALLBACK SEED DATA
   ========================================================================== */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface Project {
  id: string;
  title: string;
  category: string;
  tag: string;
  desc: string;
  tags: string[];
  github: string;
  live: string;
  image: string;
}

export interface Profile {
  name: string;
  title: string;
  intro: string;
  description: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  twitter: string;
  codepen: string;
  bioParagraphs: string[];
  techList: string[];
}

export interface Skill {
  category: string;
  items: { name: string; value: number }[];
}

export interface Experience {
  date: string;
  title: string;
  company: string;
  desc: string;
}

// --- Dynamic API Fetch Wrappers ---

export async function fetchProfile(): Promise<Profile> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/profile?populate=*`, {
      next: { revalidate: 600 } // Cache and revalidate every 10 mins
    });
    if (!res.ok) throw new Error('CMS profile fetch failed');
    const data = await res.json();
    return formatStrapiProfile(data.data);
  } catch (err) {
    console.warn('Strapi offline or profile not configured. Loading local fallback data...', err);
    return FALLBACK_PROFILE;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?populate=*`, {
      next: { revalidate: 600 }
    });
    if (!res.ok) throw new Error('CMS projects fetch failed');
    const data = await res.json();
    return formatStrapiProjects(data.data);
  } catch (err) {
    console.warn('Strapi offline or projects not configured. Loading local fallback data...', err);
    return FALLBACK_PROJECTS;
  }
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/skills?populate=*`, {
      next: { revalidate: 600 }
    });
    if (!res.ok) throw new Error('CMS skills fetch failed');
    const data = await res.json();
    return formatStrapiSkills(data.data);
  } catch (err) {
    console.warn('Strapi offline or skills not configured. Loading local fallback data...', err);
    return FALLBACK_SKILLS;
  }
}

export async function fetchExperience(): Promise<Experience[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/experiences?populate=*`, {
      next: { revalidate: 600 }
    });
    if (!res.ok) throw new Error('CMS experience fetch failed');
    const data = await res.json();
    return formatStrapiExperiences(data.data);
  } catch (err) {
    console.warn('Strapi offline or experience not configured. Loading local fallback data...', err);
    return FALLBACK_EXPERIENCE;
  }
}

// --- Strapi JSON Payload Formatters (Adapters) ---

function formatStrapiProfile(data: any): Profile {
  if (!data || !data.attributes) return FALLBACK_PROFILE;
  const attr = data.attributes;
  return {
    name: attr.name || FALLBACK_PROFILE.name,
    title: attr.title || FALLBACK_PROFILE.title,
    intro: attr.intro || FALLBACK_PROFILE.intro,
    description: attr.description || FALLBACK_PROFILE.description,
    email: attr.email || FALLBACK_PROFILE.email,
    location: attr.location || FALLBACK_PROFILE.location,
    github: attr.github || FALLBACK_PROFILE.github,
    linkedin: attr.linkedin || FALLBACK_PROFILE.linkedin,
    twitter: attr.twitter || FALLBACK_PROFILE.twitter,
    codepen: attr.codepen || FALLBACK_PROFILE.codepen,
    bioParagraphs: attr.bioParagraphs ? attr.bioParagraphs.split('\n') : FALLBACK_PROFILE.bioParagraphs,
    techList: attr.techList ? attr.techList.split(',').map((t: string) => t.trim()) : FALLBACK_PROFILE.techList
  };
}

function formatStrapiProjects(data: any[]): Project[] {
  if (!data || data.length === 0) return FALLBACK_PROJECTS;
  return data.map((item: any) => {
    const attr = item.attributes;
    // Handle nested media file path if image is uploaded to Strapi media library
    let imageUrl = '';
    if (attr.image && attr.image.data && attr.image.data.attributes) {
      const imgAttr = attr.image.data.attributes;
      imageUrl = imgAttr.url.startsWith('/') ? `${STRAPI_URL}${imgAttr.url}` : imgAttr.url;
    }
    
    return {
      id: item.id.toString(),
      title: attr.title,
      category: attr.category || 'frontend',
      tag: attr.tag || '',
      desc: attr.desc,
      tags: attr.tags ? attr.tags.split(',').map((t: string) => t.trim()) : [],
      github: attr.github || '#',
      live: attr.live || '#',
      image: imageUrl
    };
  });
}

function formatStrapiSkills(data: any[]): Skill[] {
  if (!data || data.length === 0) return FALLBACK_SKILLS;
  // Groups items by category
  const categories: { [key: string]: { name: string; value: number }[] } = {};
  data.forEach((item: any) => {
    const attr = item.attributes;
    const cat = attr.category || 'General';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push({
      name: attr.name,
      value: parseInt(attr.value) || 0
    });
  });
  
  return Object.keys(categories).map(catName => ({
    category: catName,
    items: categories[catName]
  }));
}

function formatStrapiExperiences(data: any[]): Experience[] {
  if (!data || data.length === 0) return FALLBACK_EXPERIENCE;
  return data.map((item: any) => {
    const attr = item.attributes;
    return {
      date: attr.date,
      title: attr.title,
      company: attr.company,
      desc: attr.desc
    };
  }).sort((a, b) => b.date.localeCompare(a.date)); // Sort chronologically desc
}

// --- Premium Mock Fallback Datastore ---

const FALLBACK_PROFILE: Profile = {
  name: "Samir Anik",
  title: "Full Stack Engineer",
  intro: "Hello World, I'm",
  description: "I build highly interactive, responsive, and visually stunning digital products that bridge the gap between complex backend architectures and high-end frontend user experiences.",
  email: "samir.anik.dev@gmail.com",
  location: "Dhaka, Bangladesh",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  twitter: "https://twitter.com",
  codepen: "https://codepen.io",
  bioParagraphs: [
    "Hello! I'm Samir, a software engineer with a deep passion for designing interfaces that feel alive. My journey into coding began out of curiosity about how complex animations on top-tier websites were crafted, which quickly evolved into a full-blown obsession with modern web performance and engineering.",
    "Today, I specialize in crafting robust web architectures, writing optimized, responsive interfaces, and developing clean APIs. I thrive at the intersection of developer experience, animation details, and clean software architecture."
  ],
  techList: [
    "JavaScript (ES6+)",
    "React & Next.js",
    "Node.js & Express",
    "Python & Flask",
    "PostgreSQL / Spanner",
    "GCP (Cloud Storage/BigQuery)"
  ]
};

const FALLBACK_PROJECTS: Project[] = [
  {
    id: "project-1",
    title: "Aetherial AI",
    category: "ai",
    tag: "AI Powered",
    desc: "An interactive creative workspace integration powered by Gemini. Resolves real-time UI/UX mockups, styles, and codes layouts dynamically with live visual rendering.",
    tags: ["React", "Next.js", "Node.js", "Gemini API"],
    github: "https://github.com",
    live: "https://github.com",
    image: ""
  },
  {
    id: "project-2",
    title: "NovaStream",
    category: "fullstack",
    tag: "Data Analytics",
    desc: "A real-time data streaming and analytics pipeline handling ingestion telemetry, dashboard rendering, and alerts with latency under 15ms.",
    tags: ["Next.js", "Redis", "Spanner", "ChartJS"],
    github: "https://github.com",
    live: "https://github.com",
    image: ""
  },
  {
    id: "project-3",
    title: "Crypta Vault",
    category: "frontend",
    tag: "Security",
    desc: "A localized, offline-first encrypted password and credentials manager. Uses AES-256 GCM in the browser, featuring premium dynamic charts and glassmorphism.",
    tags: ["TypeScript", "Web Crypto", "Tailwind CSS", "HTML5"],
    github: "https://github.com",
    live: "https://github.com",
    image: ""
  }
];

const FALLBACK_SKILLS: Skill[] = [
  {
    category: "Frontend Development",
    items: [
      { name: "HTML5 / CSS3 / ES6+", value: 95 },
      { name: "React.js / Next.js", value: 90 },
      { name: "TypeScript", value: 85 },
      { name: "Animation CSS / Framer / WebGL", value: 88 }
    ]
  },
  {
    category: "Backend & Database",
    items: [
      { name: "Node.js / Express", value: 92 },
      { name: "Python / Flask / Django", value: 80 },
      { name: "SQL (PostgreSQL, Spanner)", value: 85 },
      { name: "REST APIs & GraphQL", value: 90 }
    ]
  },
  {
    category: "Cloud & Workflows",
    items: [
      { name: "GCP / Cloud Storage / Cloud Run", value: 85 },
      { name: "Docker / Containers", value: 80 },
      { name: "Git / GitHub CI/CD", value: 90 },
      { name: "Figma / UI Design", value: 85 }
    ]
  }
];

const FALLBACK_EXPERIENCE: Experience[] = [
  {
    date: "2024 - Present",
    title: "Lead Full-Stack Developer",
    company: "Nexus Tech Solutions",
    desc: "Orchestrated architectural design and development of cloud-native web portals. Mentored 4 junior developers and implemented CI/CD pipelines reducing deployment times by 35%. Optimized database queries on Cloud Spanner ensuring high-availability during peak traffic."
  },
  {
    date: "2022 - 2024",
    title: "Software Engineer",
    company: "Prism Creative Studios",
    desc: "Built interactive websites and dashboards using React, Node.js, and CSS animations. Worked closely with UI/UX designers to translate Figma design tokens into clean modular styled components. Improved SEO scores from 72 to 100 on primary landing pages."
  },
  {
    date: "2020 - 2022",
    title: "Frontend Developer Associate",
    company: "Hyperion Labs",
    desc: "Handled interface development, component layouts, and cross-browser testing. Built custom CSS animation micro-libraries for product marketing pages. Gained deep understanding of semantic HTML structures and web accessibility standards."
  }
];
