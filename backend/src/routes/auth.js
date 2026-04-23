// ── auth.js ──────────────────────────────────────────────────
const express  = require('express')
const passport = require('passport')
const { register, login, refresh, logout, googleCallback, getMe } = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')
const { body, validationResult } = require('express-validator')

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ message: 'Validation error', errors: errors.array() })
  next()
}

router.post('/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['student', 'tutor']),
  ],
  validate,
  register
)

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  login
)

router.post('/refresh', refresh)
router.post('/logout', requireAuth, logout)
router.get('/me', requireAuth, getMe)

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallback
)

module.exports = router
