const express = require('express')
const router = express.Router()
const { query } = require('../config/database')

router.get('/', async (req, res, next) => {
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
      ORDER BY u.xp DESC LIMIT 50
    `)
    res.json({ leaderboard: result.rows })
  } catch (err) { next(err) }
})

module.exports = router
