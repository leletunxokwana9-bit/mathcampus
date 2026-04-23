const passport = require('passport')

/**
 * Require a valid JWT. Attaches req.user.
 */
const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err)   return next(err)
    if (!user) return res.status(401).json({ message: 'Unauthorized — please sign in.' })
    req.user = user
    next()
  })(req, res, next)
}

/**
 * Require one of the specified roles.
 * @param {...string} roles  e.g. 'admin', 'tutor'
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized.' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden — insufficient permissions.' })
  }
  next()
}

/**
 * Optional auth — attaches req.user if token present, proceeds either way.
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) req.user = user
    next()
  })(req, res, next)
}

module.exports = { requireAuth, requireRole, optionalAuth }
