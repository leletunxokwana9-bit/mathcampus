const { createClient } = require('redis')

let client

const connectRedis = async () => {
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
  })
  client.on('error', (err) => console.error('Redis error:', err))
  client.on('reconnecting', () => console.log('Redis reconnecting...'))
  await client.connect()
  console.log('✅ Redis connected')
  return client
}

const getRedis = () => client

// ── Cache helpers ────────────────────────────────────────────
/**
 * Get a cached value; if miss, call fetchFn and cache the result.
 * @param {string} key
 * @param {Function} fetchFn  async function returning the value
 * @param {number} ttlSeconds
 */
const cache = async (key, fetchFn, ttlSeconds = 300) => {
  const cached = await client.get(key)
  if (cached) return JSON.parse(cached)

  const value = await fetchFn()
  await client.setEx(key, ttlSeconds, JSON.stringify(value))
  return value
}

const invalidate = (...keys) => Promise.all(keys.map(k => client.del(k)))

const invalidatePattern = async (pattern) => {
  const keys = await client.keys(pattern)
  if (keys.length) await client.del(keys)
}

module.exports = { connectRedis, getRedis, cache, invalidate, invalidatePattern }
