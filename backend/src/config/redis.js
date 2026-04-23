const { createClient } = require('redis')

let client = null
let isConnected = false

const connectRedis = async () => {
  const url = process.env.REDIS_URL

  if (!url) {
    console.log('⚠️ Redis not configured — caching disabled')
    return null
  }

  try {
    client = createClient({ url })

    client.on('error', (err) => {
      console.log('⚠️ Redis error:', err.message)
    })

    await client.connect()

    isConnected = true
    console.log('✅ Redis connected')

    return client
  } catch (err) {
    console.log('⚠️ Redis failed — app continues without cache')
    client = null
    isConnected = false
    return null
  }
}

// SAFE cache wrapper (never breaks app)
const cache = async (key, fetchFn, ttl = 300) => {
  try {
    if (!client || !isConnected) {
      return await fetchFn()
    }

    const cached = await client.get(key)
    if (cached) return JSON.parse(cached)

    const value = await fetchFn()
    await client.setEx(key, ttl, JSON.stringify(value))

    return value
  } catch (err) {
    return await fetchFn()
  }
}

const getRedis = () => client

const invalidate = async () => {}
const invalidatePattern = async () => {}

module.exports = {
  connectRedis,
  getRedis,
  cache,
  invalidate,
  invalidatePattern
}