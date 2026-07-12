const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD',
] as const

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.warn(`Missing env vars: ${missing.join(', ')}`)
  }
}

export const env = {
  get supabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL! },
  get supabaseAnonKey() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
  get serviceRoleKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY! },
  get adminPassword() { return process.env.ADMIN_PASSWORD! },
}
