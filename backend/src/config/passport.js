const passport       = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { query }      = require('./database')

// ── JWT Strategy ─────────────────────────────────────────────
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET,
  },
  async (payload, done) => {
    try {
      const result = await query('SELECT id, name, email, role, xp FROM users WHERE id = $1 AND is_active = true', [payload.sub])
      if (!result.rows.length) return done(null, false)
      return done(null, result.rows[0])
    } catch (err) {
      return done(err, false)
    }
  }
))

// ── Google OAuth Strategy ────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const name  = profile.displayName
      const googleId = profile.id
      const avatar = profile.photos?.[0]?.value

      // Upsert user
      const result = await query(
        `INSERT INTO users (name, email, google_id, avatar, role, is_active)
         VALUES ($1, $2, $3, $4, 'student', true)
         ON CONFLICT (email)
         DO UPDATE SET google_id = $3, avatar = $4, updated_at = NOW()
         RETURNING id, name, email, role, xp`,
        [name, email, googleId, avatar]
      )
      return done(null, result.rows[0])
    } catch (err) {
      return done(err, null)
    }
  }
))

module.exports = passport
