import type { ProfileRow, ProjectRow, SkillRow, ExperienceRow, EducationRow, CertificationRow, GalleryRow, BlogRow, ContactRow } from '@/lib/database.types'

export function formatProfile(p: ProfileRow): string {
  return `👤 *${p.name || 'No Name'}*
🎯 *${p.title || 'No Title'}*
📧 Email: ${p.email || 'None'}
📍 Location: ${p.location || 'None'}
📱 Phone: ${p.phone || 'None'}
🔥 Passion: ${p.passion || 'None'}

🔗 *Links:*
• GitHub: ${p.github || 'None'}
• LinkedIn: ${p.linkedin || 'None'}
• Twitter: ${p.twitter || 'None'}
• CodePen: ${p.codepen || 'None'}
• Resume: ${p.resume_url ? `[View Document](${p.resume_url})` : 'None'}

📝 *Intro:* ${p.intro || 'None'}
💬 *Description:* ${p.description || 'None'}
🎨 *Roles:* ${p.roles_list || 'None'}
🛠️ *Tech Stack:* ${p.tech_list || 'None'}

📖 *Bio:*
${p.bio_paragraphs || 'None'}`
}

export function formatProject(p: ProjectRow): string {
  return `🖥️ *${p.title || 'Untitled'}*
📂 Category: \`${p.category || 'None'}\`
🏷️ Badge Tag: \`${p.tag || 'None'}\`
💬 Description: ${p.desc || 'None'}
🛠️ Tech: ${p.tags || 'None'}
🔗 GitHub: ${p.github || 'None'}
🌐 Live Demo: ${p.live || 'None'}
🖼️ Image: ${p.image || 'None'}
📊 Diagram: ${p.diagram_url || 'None'}
🔢 Sort Order: ${p.sort_order ?? 0}
🆔 ID: \`${p.id}\``
}

export function formatProjectList(projects: ProjectRow[]): string {
  if (projects.length === 0) return 'No projects found.'
  return projects.map((p, idx) => `${idx + 1}. *${p.title}* [${p.category}] (ID: \`${p.id}\`)`).join('\n')
}

export function formatBlog(b: BlogRow): string {
  return `📝 *${b.title || 'Untitled'}*
🔗 Slug: \`${b.slug || 'None'}\`
🏷️ Tags: ${b.tags || 'None'}
📅 Date: ${b.created_at ? new Date(b.created_at).toLocaleDateString() : 'None'}
📢 Status: ${b.published ? '✅ Published' : '📁 Draft'}
💬 Excerpt: ${b.excerpt || 'None'}
🖼️ Cover Image: ${b.cover_image || 'None'}
⏳ Read Time: ${b.read_time || 'None'}
📄 Read Path: \`/blog_read_${b.slug}\`
🆔 ID: \`${b.id}\``
}

export function formatBlogList(blogs: BlogRow[]): string {
  if (blogs.length === 0) return 'No articles found.'
  return blogs.map((b, idx) => {
    const status = b.published ? '🟢' : '⚪'
    return `${idx + 1}. ${status} *${b.title}* (ID: \`${b.id}\` | \`/${b.slug}\`)`
  }).join('\n')
}

export function formatSkillGroup(skills: SkillRow[]): string {
  if (skills.length === 0) return 'No skills found.'
  
  const grouped: Record<string, SkillRow[]> = {}
  skills.forEach((s) => {
    const cat = s.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(s)
  })

  let output = '📊 *Skills & Expertise*'
  Object.keys(grouped).forEach((cat) => {
    output += `\n\n*${cat}*`
    grouped[cat].forEach((s) => {
      output += `\n • ${s.name}: ${s.value}% \`[ID: ${s.id}]\``
    })
  })
  return output
}

export function formatGalleryItem(g: GalleryRow, idx: number): string {
  return `🖼️ *${idx}. ${g.title || 'Untitled'}*
💬 Description: ${g.description || 'None'}
🔗 URL: ${g.image || 'None'}
🆔 ID: \`${g.id}\``
}

export function formatCert(c: CertificationRow): string {
  return `🏅 *${c.title || 'Untitled'}*
🏢 Issuer: ${c.issuer || 'None'}
📅 Date: ${c.date || 'None'}
🔗 Credential URL: ${c.credential_url || 'None'}
🖼️ Badge Image: ${c.image || 'None'}
🆔 ID: \`${c.id}\``
}

export function formatCertList(certs: CertificationRow[]): string {
  if (certs.length === 0) return 'No certifications found.'
  return certs.map((c, idx) => `${idx + 1}. *${c.title}* — ${c.issuer} (ID: \`${c.id}\`)`).join('\n')
}

export function formatExperience(e: ExperienceRow): string {
  return `💼 *${e.title || 'Untitled'}* @ *${e.company || 'Unknown Company'}*
📅 Duration: ${e.date || 'None'}
💬 Description: ${e.desc || 'None'}
🆔 ID: \`${e.id}\``
}

export function formatExperienceList(exps: ExperienceRow[]): string {
  if (exps.length === 0) return 'No experiences found.'
  return exps.map((e, idx) => `${idx + 1}. *${e.title}* @ ${e.company} (ID: \`${e.id}\`)`).join('\n')
}

export function formatEducation(e: EducationRow): string {
  const typeIcon = e.type === 'education' ? '🎓' : e.type === 'award' ? '🏆' : '📢'
  return `${typeIcon} *${e.title || 'Untitled'}* [${e.type || 'education'}]
🏫 Subtitle/Issuer: ${e.subtitle || 'None'}
📅 Date: ${e.date || 'None'}
💬 Details: ${e.details || 'None'}
🆔 ID: \`${e.id}\``
}

export function formatEducationList(edus: EducationRow[]): string {
  if (edus.length === 0) return 'No education records found.'
  return edus.map((e, idx) => {
    const typeIcon = e.type === 'education' ? '🎓' : e.type === 'award' ? '🏆' : '📢'
    return `${idx + 1}. ${typeIcon} *${e.title}* (ID: \`${e.id}\`)`
  }).join('\n')
}

export function formatMessage(m: ContactRow): string {
  return `📬 *Contact Message*

👤 *Name:* ${m.name || 'Anonymous'}
✉️ *Email:* ${m.email || 'None'}
📝 *Subject:* ${m.subject || 'No Subject'}
📅 *Date:* ${m.created_at ? new Date(m.created_at).toLocaleString() : 'None'}

💬 *Message:*
${m.message || 'No message content.'}

🆔 ID: \`${m.id}\``
}

export function formatShortMessage(m: ContactRow): string {
  return `#${m.id} — *${m.name}*: ${m.subject || 'No Subject'}`
}

export function helpText(): string {
  return `🤖 *Portfolio Manager Bot Commands*

🔐 *Authentication*
/start - Initialize bot and show help menu
/cancel - Abort the current dynamic conversation wizard

👤 *Profile Management*
/profile - View your profile card
/profile edit - Pick a field and update its content
/profile avatar - Send a photo to update your avatar
/profile phone - Change the admin verification phone number

📝 *Blog posts*
/blog - List your blog posts (with inline status toggles and actions)
/blog create - 7-step wizard to write a draft/post
/blog edit <id> - Edit a specific blog post field
/blog delete <id> - Remove an article permanently
/blog publish <id> - Toggle published status

🖥️ *Projects*
/project - List all projects
/project create - 9-step wizard to add a project with photo
/project edit <id> - Edit project fields
/project delete <id> - Remove a project

📊 *Skills*
/skill - List skills grouped by category
/skill add Name | Value | Category | [Icon] - Quick insert
/skill edit <id> - Edit skill rating
/skill delete <id> - Remove a skill

💼 *Work Experience*
/experience - List timeline items
/experience create - Timeline item wizard
/experience edit <id> - Edit experience fields
/experience delete <id> - Delete experience item

🎓 *Education & Awards*
/education - List education, awards, activities
/education create - Step-by-step history item creator
/education edit <id> - Edit education fields
/education delete <id> - Delete education item

🖼️ *Gallery Items*
/gallery - List gallery items with delete triggers
/gallery upload - Image → Title → Description wizard
/gallery delete <id> - Remove a gallery item

🏅 *Certifications*
/cert - List certifications
/cert add - Certification details + badge upload wizard
/cert edit <id> - Edit certification fields
/cert delete <id> - Delete certification

📬 *Messages*
/messages - List last 20 contact submissions
/message <id> - View detailed contact message
/message delete <id> - Remove contact record`
}
