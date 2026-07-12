export const env = {
  get supabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL! },
  get supabaseAnonKey() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
  get serviceRoleKey() { return process.env.SUPABASE_SERVICE_ROLE_KEY! },
  get adminPassword() { return process.env.ADMIN_PASSWORD! },
}
