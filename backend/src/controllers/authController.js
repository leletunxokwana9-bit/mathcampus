const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { query } = require('../config/database')
const { getRedis } = require('../config/redis')

const SALT_ROUNDS = 12

// ── Token helpers ─────────────────────────────────────────────
const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  })

const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  })

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/v1/auth',
  })
}

// ── Register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student' } = req.body

    // Check duplicate email
    const exists = await query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, xp, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role]
    )
    const user = result.rows[0]

    const accessToken  = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    // Store refresh token hash in Redis (whitelist)
    const redis = getRedis()
    await redis.setEx(`rt:${user.id}`, 7 * 24 * 3600, refreshToken)

    setRefreshCookie(res, refreshToken)
    res.status(201).json({ user, accessToken })
  } catch (err) {
    next(err)
  }
}

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const result = await query(
      'SELECT id, name, email, role, xp, password_hash, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    const user = result.rows[0]

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // Update last_login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    const { password_hash, is_active, ...safeUser } = user
    const accessToken  = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    const redis = getRedis()
    await redis.setEx(`rt:${user.id}`, 7 * 24 * 3600, refreshToken)

    setRefreshCookie(res, refreshToken)
    res.json({ user: safeUser, accessToken })
  } catch (err) {
    next(err)
  }
}

// ── Refresh ───────────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ message: 'No refresh token.' })

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' })
    }

    // Check whitelist
    const redis = getRedis()
    const stored = await redis.get(`rt:${payload.sub}`)
    if (stored !== token) return res.status(401).json({ message: 'Refresh token revoked.' })

    const newAccess  = signAccessToken(payload.sub)
    const newRefresh = signRefreshToken(payload.sub)
    await redis.setEx(`rt:${payload.sub}`, 7 * 24 * 3600, newRefresh)
    setRefreshCookie(res, newRefresh)

    res.json({ accessToken: newAccess })
  } catch (err) {
    next(err)
  }
}

// ── Logout ────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      const redis = getRedis()
      await redis.del(`rt:${req.user.id}`)
    }
    res.clearCookie('refreshToken', { path: '/v1/auth' })
    res.json({ message: 'Logged out successfully.' })
  } catch (err) {
    next(err)
  }
}

// ── Google OAuth callback ─────────────────────────────────────
const googleCallback = async (req, res) => {
  try {
    const user = req.user
    const accessToken  = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)

    const redis = getRedis()
    await redis.setEx(`rt:${user.id}`, 7 * 24 * 3600, refreshToken)
    setRefreshCookie(res, refreshToken)

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${accessToken}`)
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
  }
}

// ── Get current user ──────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ user: req.user })
}

module.exports = { register, login, refresh, logout, googleCallback, getMe }
