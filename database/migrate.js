#!/usr/bin/env node
/**
 * MathCampus Database Migration Runner
 * Usage:
 *   node database/migrate.js            # run all pending migrations
 *   node database/migrate.js --seed     # run migrations + seed data
 *   node database/migrate.js --reset    # drop + recreate (dev only!)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') })
const { Pool } = require('pg')
const fs   = require('fs')
const path = require('path')

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

const args = process.argv.slice(2)

async function run() {
  const client = await pool.connect()
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(300) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    if (args.includes('--reset')) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Cannot reset production database!')
        process.exit(1)
      }
      console.log('⚠️  Resetting database...')
      await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
      await client.query(`CREATE TABLE _migrations (id SERIAL PRIMARY KEY, filename VARCHAR(300) UNIQUE, applied_at TIMESTAMPTZ DEFAULT NOW())`)
      console.log('✅ Schema reset.')
    }

    // Run migrations
    const migrationsDir = path.join(__dirname, 'migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

    for (const file of files) {
      const applied = await client.query('SELECT id FROM _migrations WHERE filename = $1', [file])
      if (applied.rows.length) {
        console.log(`  ⏩ ${file} (already applied)`)
        continue
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      console.log(`  ✅ ${file}`)
    }

    // Run seeds
    if (args.includes('--seed')) {
      const seedsDir = path.join(__dirname, 'seeds')
      const seedFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort()
      console.log('\nRunning seeds...')
      for (const file of seedFiles) {
        const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8')
        await client.query(sql)
        console.log(`  ✅ ${file}`)
      }
    }

    console.log('\n🚀 Database ready.\n')
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
