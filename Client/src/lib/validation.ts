import { z } from 'zod'

export const ProfileSchema = z.object({
  name: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  intro: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  email: z.string().email().max(200).optional().or(z.literal('')),
  location: z.string().max(200).optional(),
  github: z.string().max(500).optional(),
  linkedin: z.string().max(500).optional(),
  twitter: z.string().max(500).optional(),
  codepen: z.string().max(500).optional(),
  bio_paragraphs: z.string().max(10000).optional(),
  tech_list: z.string().max(2000).optional(),
  avatar: z.string().max(1000).optional(),
  resume_url: z.string().max(1000).optional(),
  passion: z.string().max(200).optional(),
  roles_list: z.string().max(1000).optional(),
})

export const ProjectSchema = z.object({
  title: z.string().max(200),
  category: z.string().max(100).default(''),
  tag: z.string().max(100).default(''),
  desc: z.string().max(5000).default(''),
  tags: z.string().max(1000).default(''),
  github: z.string().max(500).default(''),
  live: z.string().max(500).default(''),
  image: z.string().max(1000).default(''),
  diagram_url: z.string().max(1000).default(''),
  sort_order: z.number().int().optional(),
})

export const SkillSchema = z.object({
  category: z.string().max(200),
  name: z.string().max(200),
  value: z.number().int().min(0).max(100),
  sort_order: z.number().int().optional(),
})

export const ExperienceSchema = z.object({
  date: z.string().max(100).default(''),
  title: z.string().max(200),
  company: z.string().max(200),
  desc: z.string().max(5000).default(''),
  sort_order: z.number().int().optional(),
})

export const EducationSchema = z.object({
  type: z.enum(['education', 'award', 'activity']).default('education'),
  title: z.string().max(300).default(''),
  subtitle: z.string().max(500).default(''),
  date: z.string().max(100).default(''),
  details: z.string().max(10000).default(''),
  sort_order: z.number().int().optional(),
})

export const CertificationSchema = z.object({
  title: z.string().max(300).default(''),
  issuer: z.string().max(300).default(''),
  date: z.string().max(100).default(''),
  credential_url: z.string().max(1000).default(''),
  image: z.string().max(1000).default(''),
  sort_order: z.number().int().optional(),
})

export const GallerySchema = z.object({
  title: z.string().max(300).default(''),
  image: z.string().max(1000).default(''),
  description: z.string().max(2000).default(''),
  sort_order: z.number().int().optional(),
})

export const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(500),
  message: z.string().min(1).max(10000),
})

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export type ProfileInput = z.infer<typeof ProfileSchema>
export type ProjectInput = z.infer<typeof ProjectSchema>
export type SkillInput = z.infer<typeof SkillSchema>
export type ExperienceInput = z.infer<typeof ExperienceSchema>
export type EducationInput = z.infer<typeof EducationSchema>
export type ContactInput = z.infer<typeof ContactSchema>
