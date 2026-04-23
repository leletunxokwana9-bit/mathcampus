const express = require('express')
const router = express.Router()
const { createReply, likePost } = require('../controllers/dataControllers')
const { requireAuth } = require('../middleware/auth')

router.post('/:postId/replies', requireAuth, createReply)
router.post('/:postId/like', requireAuth, likePost)

module.exports = router
