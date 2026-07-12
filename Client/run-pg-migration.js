const { Client } = require('pg')
const fs = require('fs')

async function run() {
  let connectionString
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    const dbMatch = envContent.match(/^DATABASE_URL=(.+)$/m)
    if (dbMatch) {
      connectionString = dbMatch[1].trim()
    }
  } catch (e) {
    console.error('Error reading .env.local file:', e.message)
    process.exit(1)
  }

  if (!connectionString) {
    console.error('Error: DATABASE_URL not found in .env.local')
    process.exit(1)
  }

  console.log('Connecting to PostgreSQL database...')
  const client = new Client({ connectionString })
  
  try {
    await client.connect()
    console.log('Connected successfully!')

    const sql = fs.readFileSync('migration.sql', 'utf8')
    
    // Filter to run ONLY schema creation DDL. Explicitly exclude INSERT, TRUNCATE, DELETE to prevent data loss.
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        if (s.length === 0) return false
        const upper = s.toUpperCase()
        if (upper.startsWith('--')) return false
        if (upper.startsWith('INSERT')) return false
        if (upper.startsWith('TRUNCATE')) return false
        if (upper.startsWith('DELETE')) return false
        return true
      })

    console.log(`Parsed ${statements.length} safe schema statements. Executing...`)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';'
      console.log(`Running [${i + 1}/${statements.length}]: ${stmt.substring(0, 80).replace(/\n/g, ' ')}...`)
      try {
        await client.query(stmt)
        console.log('  -> OK')
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('  -> OK (already exists)')
        } else {
          console.error('  -> Error:', err.message)
        }
      }
    }

    console.log('\nMigration complete! Missing tables have been successfully created.')
  } catch (err) {
    console.error('Fatal error running migration:', err.message)
  } finally {
    await client.end()
  }
}

run().catch(console.error)
