const { createClient } = require('redis')

let client

const connectRedis = async () => {
  // If Redis is not configured on Render, skip safely
  if (!process.env.REDIS_URL) {
    console.warn('⚠️ REDIS_URL not set — Redis disabled')
    return null
  }

  client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
  })

  client.on('error', (err) => {
    console.error('Redis error:', err)
  })

  client.on('reconnecting', () => {
    console.log('Redis reconnecting...')
  })

  await client.connect()

  console.log('✅ Redis connected')

  return client
}

const getRedis = () => client

// ── Cache helpers ────────────────────────────────────────────
const cache = async (key, fetchFn, ttlSeconds = 300) => {
  if (!client) return fetchFn() // fallback if Redis disabled

  const cached = await client.get(key)
  if (cached) return JSON.parse(cached)

  const value = await fetchFn()
  await client.setEx(key, ttlSeconds, JSON.stringify(value))
  return value
}

const invalidate = async (...keys) => {
  if (!client) return
  return Promise.all(keys.map((k) => client.del(k)))
}

const invalidatePattern = async (pattern) => {
  if (!client) return
  const keys = await client.keys(pattern)
  if (keys.length) await client.del(keys)
}

module.exports = {
  connectRedis,
  getRedis,
  cache,
  invalidate,
  invalidatePattern,
}