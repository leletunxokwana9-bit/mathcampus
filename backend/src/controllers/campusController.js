const { query } = require('../config/database')
const { cache, invalidate } = require('../config/redis')

// ── GET /campuses ─────────────────────────────────────────────
const getCampuses = async (req, res, next) => {
  try {
    const userId = req.user?.id

    const campusesData = await cache('campuses:all', async () => {
      const result = await query(`
        SELECT
          c.id, c.title, c.slug, c.icon, c.color, c.tag, c.tag_color,
          c.description, c.difficulty, c.estimated_hours, c.rating,
          c.student_count, c.is_published,
          COUNT(DISTINCT l.id) AS lessons_count,
          ARRAY_AGG(DISTINCT t.name ORDER BY t.sort_order) FILTER (WHERE t.name IS NOT NULL) AS topics
        FROM campuses c
        LEFT JOIN lessons l ON l.campus_id = c.id AND l.is_published = true
        LEFT JOIN campus_topics t ON t.campus_id = c.id
        WHERE c.is_published = true
        GROUP BY c.id
        ORDER BY c.sort_order ASC
      `)
      return result.rows
    }, 300) // 5-minute cache

    // If authenticated, add user-specific data
    let enrollments = {}
    let progresses  = {}

    if (userId) {
      const enrollResult = await query(
        'SELECT campus_id, progress_pct FROM enrollments WHERE user_id = $1',
        [userId]
      )
      enrollResult.rows.forEach(r => {
        enrollments[r.campus_id] = true
        progresses[r.campus_id]  = r.progress_pct
      })
    }

    const campuses = campusesData.map(c => ({
      ...c,
      lessonsCount: parseInt(c.lessons_count) || 0,
      enrolled:     !!enrollments[c.id],
      userProgress: progresses[c.id] || 0,
    }))

    res.json({ campuses })
  } catch (err) {
    next(err)
  }
}

// ── GET /campuses/:id ─────────────────────────────────────────
const getCampus = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const result = await query(`
      SELECT
        c.id, c.title, c.slug, c.icon, c.color, c.tag, c.tag_color,
        c.description, c.difficulty, c.estimated_hours, c.rating, c.student_count,
        COUNT(DISTINCT l.id) AS lessons_count,
        ARRAY_AGG(DISTINCT t.name ORDER BY t.sort_order) FILTER (WHERE t.name IS NOT NULL) AS topics
      FROM campuses c
      LEFT JOIN lessons l ON l.campus_id = c.id AND l.is_published = true
      LEFT JOIN campus_topics t ON t.campus_id = c.id
      WHERE c.id = $1 AND c.is_published = true
      GROUP BY c.id
    `, [id])

    if (!result.rows.length) return res.status(404).json({ message: 'Campus not found.' })

    const campus = result.rows[0]
    campus.lessonsCount = parseInt(campus.lessons_count) || 0

    // Resources
    const resourcesResult = await query(
      'SELECT id, title, type, file_size, download_count AS downloads, is_premium AS premium FROM resources WHERE campus_id = $1 ORDER BY sort_order',
      [id]
    )
    campus.resources = resourcesResult.rows.map(r => ({ ...r, size: r.file_size }))

    // User-specific
    if (userId) {
      const enrollResult = await query(
        'SELECT progress_pct FROM enrollments WHERE user_id = $1 AND campus_id = $2',
        [userId, id]
      )
      campus.enrolled     = enrollResult.rows.length > 0
      campus.userProgress = enrollResult.rows[0]?.progress_pct || 0
    } else {
      campus.enrolled     = false
      campus.userProgress = 0
    }

    res.json({ campus })
  } catch (err) {
    next(err)
  }
}

// ── POST /campuses/:id/enroll ─────────────────────────────────
const enrollCampus = async (req, res, next) => {
  try {
    const { id: campusId } = req.params
    const userId = req.user.id

    // Check campus exists
    const c = await query('SELECT id, title FROM campuses WHERE id = $1', [campusId])
    if (!c.rows.length) return res.status(404).json({ message: 'Campus not found.' })

    // Upsert enrollment
    await query(
      `INSERT INTO enrollments (user_id, campus_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, campus_id) DO NOTHING`,
      [userId, campusId]
    )

    // Increment student count
    await query('UPDATE campuses SET student_count = student_count + 1 WHERE id = $1', [campusId])

    // Log activity
    await query(
      `INSERT INTO activity_log (user_id, type, metadata)
       VALUES ($1, 'enrolled', $2)`,
      [userId, JSON.stringify({ campusId, campusTitle: c.rows[0].title })]
    )

    await invalidate('campuses:all', `campuses:${campusId}`)

    res.status(201).json({ message: 'Enrolled successfully.' })
  } catch (err) {
    next(err)
  }
}

// ── GET /campuses/:id/quiz (for practice zone) ────────────────
const getCampusQuiz = async (req, res, next) => {
  try {
    const { id: campusId } = req.params

    const result = await query(`
      SELECT q.id, q.title
      FROM quizzes q
      WHERE q.campus_id = $1 AND q.is_published = true
      ORDER BY q.created_at DESC
      LIMIT 1
    `, [campusId])

    if (!result.rows.length) return res.status(404).json({ message: 'No quiz available.' })

    const quiz = result.rows[0]
    const questionsResult = await query(`
      SELECT id, question, options, correct_index, explanation, difficulty
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY sort_order, id
    `, [quiz.id])

    quiz.questions = questionsResult.rows.map(q => ({
      ...q,
      options: q.options, // already jsonb array from pg
      correctIndex: q.correct_index,
    }))

    res.json({ quiz })
  } catch (err) {
    next(err)
  }
}

module.exports = { getCampuses, getCampus, enrollCampus, getCampusQuiz }
