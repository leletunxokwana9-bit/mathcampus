// ── errorHandler ────────────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}`, err)

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(422).json({ message: 'Validation error', errors: err.errors })
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with that value already exists.' })
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Invalid reference ID.' })
  }

  const status = err.status || err.statusCode || 500
  const message = status < 500 ? err.message : 'Internal server error'

  return res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// ── notFound ─────────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
}

module.exports = { errorHandler, notFound }
