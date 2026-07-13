import { revalidatePath, revalidateTag } from 'next/cache'

export function revalidateHome() {
  revalidatePath('/', 'layout')
  revalidateTag('profile', 'max')
  revalidateTag('projects', 'max')
  revalidateTag('skills', 'max')
  revalidateTag('experiences', 'max')
  revalidateTag('education', 'max')
  revalidateTag('certifications', 'max')
  revalidateTag('gallery', 'max')
  revalidateTag('blogs', 'max')
}
