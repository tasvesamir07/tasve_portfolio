export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.DATABASE_URL) {
    const { migrate } = await import('./lib/migrate')
    const result = await migrate()
    if (!result.ok && result.reason) {
      console.warn('[instrumentation] Migration:', result.reason)
    }
  }
}
