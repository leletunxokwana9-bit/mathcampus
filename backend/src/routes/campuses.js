// ── campuses.js ──────────────────────────────────────────────
const express = require('express')
const { getCampuses, getCampus, enrollCampus, getCampusQuiz } = require('../controllers/campusController')
const { getLessons } = require('../controllers/dataControllers')
const { getPosts, createPost } = require('../controllers/dataControllers')
const { requireAuth, optionalAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/',       optionalAuth, getCampuses)
router.get('/:id',    optionalAuth, getCampus)
router.post('/:id/enroll',  requireAuth, enrollCampus)
router.get('/:id/lessons',  optionalAuth, getLessons)
router.get('/:campusId/quiz', optionalAuth, getCampusQuiz)
router.get('/:campusId/posts', getPosts)
router.post('/:campusId/posts', requireAuth, createPost)

module.exports = router

// ────────────────────────────────────────────────────────────────────────────
// File: lessons.js
const lessonsRouter = express.Router()
const { completeLesson } = require('../controllers/dataControllers')
lessonsRouter.post('/:lessonId/complete', requireAuth, completeLesson)
module.exports.lessonsRouter = lessonsRouter

// ────────────────────────────────────────────────────────────────────────────
// File: quizzes.js
const quizzesRouter = express.Router()
const { submitQuiz } = require('../controllers/dataControllers')
quizzesRouter.post('/:quizId/submit', requireAuth, submitQuiz)
module.exports.quizzesRouter = quizzesRouter

// ────────────────────────────────────────────────────────────────────────────
// File: progress.js
const progressRouter = express.Router()
const { getMyProgress } = require('../controllers/dataControllers')
progressRouter.get('/me', requireAuth, getMyProgress)
module.exports.progressRouter = progressRouter

// ────────────────────────────────────────────────────────────────────────────
// File: posts.js
const postsRouter = express.Router()
const { createReply, likePost } = require('../controllers/dataControllers')
postsRouter.post('/:postId/replies', requireAuth, createReply)
postsRouter.post('/:postId/like',    requireAuth, likePost)
module.exports.postsRouter = postsRouter

// ────────────────────────────────────────────────────────────────────────────
// File: leaderboard.js
const leaderboardRouter = express.Router()
const { query } = require('../config/database')
leaderboardRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT u.id, u.name, u.xp, u.avatar,
             COUNT(DISTINCT e.campus_id) AS campuses_enrolled,
             COUNT(DISTINCT lc.lesson_id) AS lessons_done
      FROM users u
      LEFT JOIN enrollments e ON e.user_id = u.id
      LEFT JOIN lesson_completions lc ON lc.user_id = u.id
      WHERE u.is_active = true
      GROUP BY u.id
      ORDER BY u.xp DESC
      LIMIT 50
    `)
    res.json({ leaderboard: result.rows })
  } catch (err) { next(err) }
})
module.exports.leaderboardRouter = leaderboardRouter

// ────────────────────────────────────────────────────────────────────────────
// File: uploads.js (presigned S3 URL generation)
const uploadsRouter = express.Router()
const { requireAuth: ra, requireRole } = require('../middleware/auth')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { v4: uuidv4 } = require('uuid')

const s3 = new S3Client({ region: process.env.AWS_REGION || 'af-south-1' })

uploadsRouter.post('/presign', ra, requireRole('tutor', 'admin'), async (req, res, next) => {
  try {
    const { filename, contentType } = req.body
    const key = `uploads/${uuidv4()}-${filename}`
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key:    key,
      ContentType: contentType,
    })
    const url = await getSignedUrl(s3, command, { expiresIn: 300 })
    res.json({ uploadUrl: url, key, publicUrl: `${process.env.CLOUDFRONT_DOMAIN}/${key}` })
  } catch (err) { next(err) }
})
module.exports.uploadsRouter = uploadsRouter
