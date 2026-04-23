const express = require('express')
const router = express.Router()
const { getMyProgress } = require('../controllers/dataControllers')
const { requireAuth } = require('../middleware/auth')

router.get('/me', requireAuth, getMyProgress)

module.exports = router
