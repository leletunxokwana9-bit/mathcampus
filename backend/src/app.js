require('dotenv').config()
const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const morgan      = require('morgan')
const compression = require('compression')
const rateLimit   = require('express-rate-limit')
const passport    = require('passport')

const { connectDB } = require('./config/database')

// ── Redis (SAFE OPTIONAL CONNECT) ───────────────────────────
let connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('⚠️ Redis not configured — caching disabled')
    return null
  }

  try {
    const { connectRedis } = require('./config/redis')
    return await connectRedis()
  } catch (err) {
    console.log('⚠️ Redis connection failed — continuing without cache')
    console.error(err.message)
    return null
  }
}

require('./config/passport')

// ── Routes ───────────────────────────────────────────────────
const authRoutes        = require('./routes/auth')
const campusRoutes      = require('./routes/campuses')
const lessonRoutes      = require('./routes/lessons')
const quizRoutes        = require('./routes/quizzes')
const progressRoutes    = require('./routes/progress')
const postRoutes        = require('./routes/posts')
const leaderboardRoutes = require('./routes/leaderboard')
const uploadRoutes      = require('./routes/uploads')

const { errorHandler, notFound } = require('./middleware/errorHandler')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security & parsing ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))

app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(passport.initialize())

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
})

app.use('/v1', limiter)

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: require('../package.json').version,
  })
})

// ── API routes ────────────────────────────────────────────────
app.use('/v1/auth',        authRoutes)
app.use('/v1/campuses',    campusRoutes)
app.use('/v1/lessons',     lessonRoutes)
app.use('/v1/quizzes',     quizRoutes)
app.use('/v1/progress',    progressRoutes)
app.use('/v1/posts',       postRoutes)
app.use('/v1/leaderboard', leaderboardRoutes)
app.use('/v1/uploads',     uploadRoutes)

// ── Error handling ────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Start server ─────────────────────────────────────────────
async function start() {
  try {
    await connectDB()
    await connectRedis()

    app.listen(PORT, () => {
      console.log(`\n🚀 MathCampus API running on port ${PORT}`)
      console.log(`   Environment : ${process.env.NODE_ENV}`)
      console.log(`   Health check: /health\n`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

start()

module.exports = app