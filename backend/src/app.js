require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const compression = require('compression')
const rateLimit  = require('express-rate-limit')
const passport   = require('passport')

const { connectDB }    = require('./config/database')
const { connectRedis } = require('./config/redis')
require('./config/passport')

// ── Routes ───────────────────────────────────────────────────
const authRoutes       = require('./routes/auth')
const campusRoutes     = require('./routes/campuses')
const lessonRoutes     = require('./routes/lessons')
const quizRoutes       = require('./routes/quizzes')
const progressRoutes   = require('./routes/progress')
const postRoutes       = require('./routes/posts')
const leaderboardRoutes = require('./routes/leaderboard')
const uploadRoutes     = require('./routes/uploads')

const errorHandler = require('./middleware/errorHandler')
const notFound = require('./middleware/notFound')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security & parsing ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(passport.initialize())

// ── Global rate limit ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
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

// ── Start ─────────────────────────────────────────────────────
async function start() {
  try {
    await connectDB()
    await connectRedis()
    app.listen(PORT, () => {
      console.log(`\n🚀 MathCampus API running on port ${PORT}`)
      console.log(`   Environment : ${process.env.NODE_ENV}`)
      console.log(`   Health check: http://localhost:${PORT}/health\n`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()

module.exports = app // for tests
