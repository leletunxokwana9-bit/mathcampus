const { Pool } = require('pg')

let pool

const connectDB = async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err)
  })

  const client = await pool.connect()
  console.log('✅ PostgreSQL connected')
  client.release()

  return pool
}

const query = (text, params) => pool.query(text, params)
const getClient = () => pool.connect()

module.exports = { connectDB, query, getClient }