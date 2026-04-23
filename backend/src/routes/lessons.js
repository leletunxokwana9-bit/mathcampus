const express = require('express')
const router = express.Router()
const { getLessons, completeLesson } = require('../controllers/dataControllers')
const { requireAuth, optionalAuth } = require('../middleware/auth')

router.get('/:lessonId', optionalAuth, async (req, res) => {
  res.json({ message: 'Lesson endpoint — connect to video host' })
})
router.post('/:lessonId/complete', requireAuth, completeLesson)

module.exports = router
