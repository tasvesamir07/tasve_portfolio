import { revalidatePath } from 'next/cache'

export function revalidateHome() {
  revalidatePath('/', 'layout')
}
