import { readFileSync } from 'fs'
import { join } from 'path'
import { Client } from 'pg'

const MIGRATION_TIMESTAMP_TABLE = '_schema_version'

interface Statement {
  sql: string
  isSeed: boolean
  isTruncate: boolean
  isDDL: boolean
}

function parseMigration(filePath: string): Statement[] {
  const raw = readFileSync(filePath, 'utf8')
  const parts = raw
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

  return parts.map(sql => ({
    sql: sql + ';',
    isSeed: /^\s*INSERT\s+INTO/i.test(sql),
    isTruncate: /^\s*TRUNCATE\s+/i.test(sql),
    isDDL: /^\s*(CREATE|ALTER|DROP|CREATE\s+POLICY)/i.test(sql),
  }))
}

function getConnectionString(): string | null {
  return process.env.DATABASE_URL || null
}

function isSeedEmptyError(msg: string): boolean {
  return msg.includes('already exists') || msg.includes('duplicate key') || msg.includes('violates unique constraint')
}

async function createVersionTable(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "${MIGRATION_TIMESTAMP_TABLE}" (
      id SERIAL PRIMARY KEY,
      statement_hash TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

function hashStatement(sql: string): string {
  let h = 0
  for (let i = 0; i < sql.length; i++) {
    h = ((h << 5) - h + sql.charCodeAt(i)) | 0
  }
  return String(h)
}

async function hasStatementRun(client: Client, hash: string): Promise<boolean> {
  const { rows } = await client.query(
    `SELECT 1 FROM "${MIGRATION_TIMESTAMP_TABLE}" WHERE statement_hash = $1 LIMIT 1`,
    [hash],
  )
  return rows.length > 0
}

async function markStatementRun(client: Client, hash: string): Promise<void> {
  try {
    await client.query(
      `INSERT INTO "${MIGRATION_TIMESTAMP_TABLE}" (statement_hash) VALUES ($1)`,
      [hash],
    )
  } catch {
    // race condition on concurrent cold-start — ignore
  }
}

export async function migrate(): Promise<{ ok: boolean; reason?: string }> {
  const conn = getConnectionString()
  if (!conn) {
    return { ok: false, reason: 'DATABASE_URL not set — skipping migration' }
  }

  const sqlPath = join(process.cwd(), 'migration.sql')
  let statements: Statement[]
  try {
    statements = parseMigration(sqlPath)
  } catch (err) {
    console.error('[migrate] Failed to parse migration.sql:', err)
    return { ok: false, reason: String(err) }
  }

  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()
    console.log('[migrate] Connected')

    await createVersionTable(client)

    for (const stmt of statements) {
      if (stmt.isTruncate) {
        console.log('[migrate] Skipping TRUNCATE:', stmt.sql.substring(0, 60) + '...')
        continue
      }

      if (stmt.isDDL) {
        try {
          await client.query(stmt.sql)
          console.log('[migrate] DDL OK:', stmt.sql.substring(0, 60) + '...')
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('already exists')) {
            console.log('[migrate] DDL skipped (exists):', stmt.sql.substring(0, 60) + '...')
          } else {
            console.error('[migrate] DDL failed:', msg)
            console.error('[migrate] SQL:', stmt.sql)
          }
        }
        continue
      }

      if (stmt.isSeed) {
        const hash = hashStatement(stmt.sql)
        const alreadyRun = await hasStatementRun(client, hash)
        if (alreadyRun) {
          console.log('[migrate] Seed skipped (already run):', stmt.sql.substring(0, 60) + '...')
          continue
        }

        try {
          await client.query(stmt.sql)
          await markStatementRun(client, hash)
          console.log('[migrate] Seed OK:', stmt.sql.substring(0, 60) + '...')
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          if (isSeedEmptyError(msg)) {
            console.log('[migrate] Seed skipped (data exists):', stmt.sql.substring(0, 60) + '...')
            await markStatementRun(client, hash)
          } else {
            console.error('[migrate] Seed failed:', msg)
          }
        }
      }
    }

    console.log('[migrate] Done')
    return { ok: true }
  } catch (err) {
    console.error('[migrate] Fatal error:', err)
    return { ok: false, reason: String(err) }
  } finally {
    try {
      await client.end()
    } catch {
      // ignore cleanup errors
    }
  }
}
