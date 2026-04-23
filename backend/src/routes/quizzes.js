const express = require('express')
const router = express.Router()
const { submitQuiz } = require('../controllers/dataControllers')
const { requireAuth } = require('../middleware/auth')
const { query } = require('../config/database')

router.get('/:quizId', async (req, res, next) => {
  try {
    const { quizId } = req.params
    const result = await query('SELECT id, title FROM quizzes WHERE id = $1', [quizId])
    if (!result.rows.length) return res.status(404).json({ message: 'Quiz not found.' })
    const quiz = result.rows[0]
    const qr = await query(
      'SELECT id, question, options, correct_index, explanation, difficulty FROM quiz_questions WHERE quiz_id = $1 ORDER BY sort_order',
      [quizId]
    )
    quiz.questions = qr.rows.map(q => ({ ...q, correctIndex: q.correct_index }))
    res.json({ quiz })
  } catch (err) { next(err) }
})
router.post('/:quizId/submit', requireAuth, submitQuiz)

module.exports = router
