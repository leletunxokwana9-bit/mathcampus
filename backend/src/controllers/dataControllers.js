// ── progressController ────────────────────────────────────────────────────────
const { query } = require('../config/database')

const getMyProgress = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Enrollment summary
    const enrollResult = await query(`
      SELECT COUNT(*) AS total_enrolled,
             SUM(progress_pct) AS total_progress
      FROM enrollments WHERE user_id = $1
    `, [userId])

    // Completed lessons
    const lessonsResult = await query(`
      SELECT COUNT(*) AS completed
      FROM lesson_completions WHERE user_id = $1
    `, [userId])

    // Quiz stats
    const quizResult = await query(`
      SELECT COUNT(*) AS quizzes_completed,
             AVG(score_pct)::int AS avg_score
      FROM quiz_attempts WHERE user_id = $1
    `, [userId])

    // Streak
    const streakResult = await query(`
      SELECT current_streak, best_streak
      FROM user_streaks WHERE user_id = $1
    `, [userId])

    // Study time (sum of lesson durations completed)
    const hoursResult = await query(`
      SELECT COALESCE(SUM(l.duration_minutes) / 60.0, 0)::numeric(6,1) AS total_hours
      FROM lesson_completions lc
      JOIN lessons l ON l.id = lc.lesson_id
      WHERE lc.user_id = $1
    `, [userId])

    // Weekly study hours (last 8 weeks)
    const weeklyResult = await query(`
      SELECT
        TO_CHAR(DATE_TRUNC('week', lc.completed_at), 'DD Mon') AS week,
        ROUND(SUM(l.duration_minutes) / 60.0, 1) AS hours
      FROM lesson_completions lc
      JOIN lessons l ON l.id = lc.lesson_id
      WHERE lc.user_id = $1 AND lc.completed_at >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', lc.completed_at)
      ORDER BY DATE_TRUNC('week', lc.completed_at)
    `, [userId])

    // Quiz history (last 10)
    const quizHistoryResult = await query(`
      SELECT qa.score_pct AS score, q.title AS quiz_title,
             TO_CHAR(qa.created_at, 'DD Mon') AS date,
             SUBSTRING(q.title, 1, 15) AS label
      FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.user_id = $1
      ORDER BY qa.created_at DESC LIMIT 10
    `, [userId])

    // Recent activity
    const activityResult = await query(`
      SELECT type, metadata, created_at
      FROM activity_log WHERE user_id = $1
      ORDER BY created_at DESC LIMIT 8
    `, [userId])

    // Badges
    const badgeResult = await query(`
      SELECT badge_label FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 8
    `, [userId])

    const enroll = enrollResult.rows[0]
    const quiz   = quizResult.rows[0]
    const streak = streakResult.rows[0] || {}

    // Total lessons across all campuses
    const totalLessonsResult = await query('SELECT COUNT(*) FROM lessons WHERE is_published = true')

    res.json({
      totalEnrolled:    parseInt(enroll.total_enrolled),
      totalHours:       parseFloat(hoursResult.rows[0]?.total_hours || 0),
      lessonsCompleted: parseInt(lessonsResult.rows[0]?.completed || 0),
      totalLessons:     parseInt(totalLessonsResult.rows[0]?.count || 0),
      quizzesCompleted: parseInt(quiz.quizzes_completed),
      avgScore:         parseInt(quiz.avg_score) || 0,
      streak:           streak.current_streak || 0,
      bestStreak:       streak.best_streak || 0,
      readiness:        Math.round((parseInt(enroll.total_progress) || 0) / Math.max(1, parseInt(enroll.total_enrolled))),
      weeklyStudyHours: weeklyResult.rows,
      quizHistory:      quizHistoryResult.rows,
      recentActivity:   activityResult.rows.map(a => ({
        text:  describeActivity(a.type, a.metadata),
        icon:  iconForActivity(a.type),
        color: colorForActivity(a.type),
        time:  timeAgo(a.created_at),
      })),
      badges: badgeResult.rows.map(b => b.badge_label),
    })
  } catch (err) {
    next(err)
  }
}

function describeActivity(type, meta) {
  const m = typeof meta === 'string' ? JSON.parse(meta) : meta || {}
  if (type === 'enrolled')        return `Enrolled: ${m.campusTitle || 'a campus'}`
  if (type === 'lesson_complete') return `Completed: ${m.lessonTitle || 'a lesson'}`
  if (type === 'quiz_attempt')    return `Quiz: ${m.score}% on ${m.quizTitle || 'a quiz'}`
  return type
}
function iconForActivity(type) {
  return { enrolled: '🏫', lesson_complete: '✅', quiz_attempt: '⚡' }[type] || '📌'
}
function colorForActivity(type) {
  return { enrolled: '#00D4FF', lesson_complete: '#00E5A0', quiz_attempt: '#FFB800' }[type] || '#6B7E99'
}
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

module.exports.getMyProgress = getMyProgress

// ────────────────────────────────────────────────────────────────────────────
// ── quizController ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params
    const { answers } = req.body // { "0": 2, "1": 0, ... }
    const userId = req.user.id

    const qResult = await query('SELECT id, campus_id FROM quizzes WHERE id = $1', [quizId])
    if (!qResult.rows.length) return res.status(404).json({ message: 'Quiz not found.' })
    const quiz = qResult.rows[0]

    const questionsResult = await query(
      'SELECT id, correct_index FROM quiz_questions WHERE quiz_id = $1 ORDER BY sort_order',
      [quizId]
    )
    const questions = questionsResult.rows

    let correct = 0
    questions.forEach((q, i) => {
      if (parseInt(answers[i]) === q.correct_index) correct++
    })

    const total      = questions.length
    const scorePct   = Math.round((correct / total) * 100)
    const passed     = scorePct >= 60

    // Store attempt
    await query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, answers, score, total, score_pct)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, quizId, JSON.stringify(answers), correct, total, scorePct]
    )

    // Award XP
    const xpEarned = passed ? 50 + (scorePct >= 80 ? 25 : 0) : 10
    await query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpEarned, userId])

    // Log activity
    const quizTitleResult = await query('SELECT title FROM quizzes WHERE id = $1', [quizId])
    await query(
      `INSERT INTO activity_log (user_id, type, metadata) VALUES ($1, 'quiz_attempt', $2)`,
      [userId, JSON.stringify({ score: scorePct, quizTitle: quizTitleResult.rows[0]?.title })]
    )

    // Check badges
    await awardBadgesIfEarned(userId, scorePct)

    res.json({ score: correct, total, percentage: scorePct, passed, xpEarned })
  } catch (err) {
    next(err)
  }
}

async function awardBadgesIfEarned(userId, score) {
  if (score === 100) {
    await query(
      `INSERT INTO user_badges (user_id, badge_label) VALUES ($1, '🎯 Perfect Score')
       ON CONFLICT DO NOTHING`,
      [userId]
    )
  }
  // First quiz badge
  const attempts = await query('SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1', [userId])
  if (parseInt(attempts.rows[0].count) === 1) {
    await query(
      `INSERT INTO user_badges (user_id, badge_label) VALUES ($1, '⭐ First Quiz')
       ON CONFLICT DO NOTHING`,
      [userId]
    )
  }
}

module.exports.submitQuiz = submitQuiz

// ────────────────────────────────────────────────────────────────────────────
// ── lessonController ──────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
const getLessons = async (req, res, next) => {
  try {
    const { campusId } = req.params
    const userId = req.user?.id

    const result = await query(`
      SELECT l.id, l.title, l.type, l.duration_minutes,
             l.video_url, l.sort_order, l.is_premium, l.is_published
      FROM lessons l
      WHERE l.campus_id = $1 AND l.is_published = true
      ORDER BY l.sort_order
    `, [campusId])

    let completedSet = new Set()
    if (userId) {
      const comp = await query(
        'SELECT lesson_id FROM lesson_completions WHERE user_id = $1',
        [userId]
      )
      comp.rows.forEach(r => completedSet.add(r.lesson_id))
    }

    // Determine locked: premium lessons locked if user has no premium subscription
    // For now, lock anything beyond lesson 9 unless enrolled
    const enrolled = userId ? await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND campus_id = $2',
      [userId, campusId]
    ) : { rows: [] }
    const isEnrolled = enrolled.rows.length > 0

    const lessons = result.rows.map((l, i) => ({
      id:       l.id,
      title:    l.title,
      type:     l.type,
      duration: `${l.duration_minutes} min`,
      videoUrl: l.video_url,
      completed: completedSet.has(l.id),
      locked:   l.is_premium && !isEnrolled,
    }))

    res.json({ lessons })
  } catch (err) {
    next(err)
  }
}

const completeLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params
    const userId = req.user.id

    // Upsert completion
    await query(
      `INSERT INTO lesson_completions (user_id, lesson_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, lesson_id) DO NOTHING`,
      [userId, lessonId]
    )

    // Recalculate campus progress
    const lessonInfo = await query('SELECT campus_id, title FROM lessons WHERE id = $1', [lessonId])
    if (lessonInfo.rows.length) {
      const { campus_id: campusId, title } = lessonInfo.rows[0]

      const totalResult = await query(
        'SELECT COUNT(*) FROM lessons WHERE campus_id = $1 AND is_published = true', [campusId]
      )
      const doneResult = await query(`
        SELECT COUNT(*) FROM lesson_completions lc
        JOIN lessons l ON l.id = lc.lesson_id
        WHERE lc.user_id = $1 AND l.campus_id = $2
      `, [userId, campusId])

      const total = parseInt(totalResult.rows[0].count)
      const done  = parseInt(doneResult.rows[0].count)
      const pct   = total > 0 ? Math.round((done / total) * 100) : 0

      await query(
        'UPDATE enrollments SET progress_pct = $1 WHERE user_id = $2 AND campus_id = $3',
        [pct, userId, campusId]
      )

      await query(
        `INSERT INTO activity_log (user_id, type, metadata) VALUES ($1, 'lesson_complete', $2)`,
        [userId, JSON.stringify({ lessonId, lessonTitle: title, campusId })]
      )

      // XP
      await query('UPDATE users SET xp = xp + 20 WHERE id = $1', [userId])

      // Streak update
      await updateStreak(userId)
    }

    res.json({ message: 'Lesson marked complete.' })
  } catch (err) {
    next(err)
  }
}

async function updateStreak(userId) {
  const today = new Date().toISOString().split('T')[0]
  const existing = await query('SELECT * FROM user_streaks WHERE user_id = $1', [userId])

  if (!existing.rows.length) {
    await query(
      'INSERT INTO user_streaks (user_id, current_streak, best_streak, last_activity_date) VALUES ($1, 1, 1, $2)',
      [userId, today]
    )
    return
  }

  const s = existing.rows[0]
  const last = s.last_activity_date?.toISOString?.()?.split('T')[0]
  if (last === today) return // already updated today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const newStreak = last === yesterday ? s.current_streak + 1 : 1
  const best = Math.max(newStreak, s.best_streak)

  await query(
    'UPDATE user_streaks SET current_streak = $1, best_streak = $2, last_activity_date = $3 WHERE user_id = $4',
    [newStreak, best, today, userId]
  )

  // 7-day streak badge
  if (newStreak === 7) {
    await query(
      `INSERT INTO user_badges (user_id, badge_label) VALUES ($1, '🔥 7-Day Streak') ON CONFLICT DO NOTHING`,
      [userId]
    )
  }
}

module.exports.getLessons    = getLessons
module.exports.completeLesson = completeLesson

// ────────────────────────────────────────────────────────────────────────────
// ── postController ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────
const getPosts = async (req, res, next) => {
  try {
    const { campusId } = req.params
    const result = await query(`
      SELECT p.id, p.content, p.is_solved AS solved, p.likes_count,
             p.created_at,
             u.id AS user_id, u.name AS user_name,
             COUNT(r.id) AS replies_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN post_replies r ON r.post_id = p.id
      WHERE p.campus_id = $1
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [campusId])

    const posts = result.rows.map(p => ({
      id:           p.id,
      content:      p.content,
      solved:       p.solved,
      likesCount:   p.likes_count,
      repliesCount: parseInt(p.replies_count),
      timeAgo:      timeAgo(p.created_at),
      avatarColor:  '#00D4FF',
      user: { id: p.user_id, name: p.user_name },
    }))

    res.json({ posts })
  } catch (err) {
    next(err)
  }
}

const createPost = async (req, res, next) => {
  try {
    const { campusId } = req.params
    const { content } = req.body
    const userId = req.user.id

    if (!content?.trim()) return res.status(400).json({ message: 'Content required.' })

    const result = await query(
      'INSERT INTO posts (campus_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
      [campusId, userId, content.trim()]
    )
    res.status(201).json({ postId: result.rows[0].id, message: 'Posted!' })
  } catch (err) {
    next(err)
  }
}

const createReply = async (req, res, next) => {
  try {
    const { postId } = req.params
    const { content } = req.body
    const userId = req.user.id
    await query(
      'INSERT INTO post_replies (post_id, user_id, content) VALUES ($1, $2, $3)',
      [postId, userId, content.trim()]
    )
    res.status(201).json({ message: 'Reply posted.' })
  } catch (err) {
    next(err)
  }
}

const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const userId = req.user.id
    // Idempotent like
    const existing = await query('SELECT id FROM post_likes WHERE post_id=$1 AND user_id=$2', [postId, userId])
    if (existing.rows.length) {
      await query('DELETE FROM post_likes WHERE post_id=$1 AND user_id=$2', [postId, userId])
      await query('UPDATE posts SET likes_count = likes_count - 1 WHERE id=$1', [postId])
      return res.json({ liked: false })
    }
    await query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId])
    await query('UPDATE posts SET likes_count = likes_count + 1 WHERE id=$1', [postId])
    res.json({ liked: true })
  } catch (err) {
    next(err)
  }
}

module.exports.getPosts    = getPosts
module.exports.createPost  = createPost
module.exports.createReply = createReply
module.exports.likePost    = likePost
