export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrate } = await import('@/lib/migrate')
    const result = await migrate()
    if (result.ok) {
      console.log('[instrumentation] Migration completed successfully')
    } else if (result.reason) {
      console.log('[instrumentation] Migration skipped:', result.reason)
    }
  }
}
