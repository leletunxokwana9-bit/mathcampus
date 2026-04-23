const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { v4: uuidv4 } = require('uuid')

const s3 = new S3Client({ region: process.env.AWS_REGION || 'af-south-1' })

router.post('/presign', requireAuth, requireRole('tutor', 'admin'), async (req, res, next) => {
  try {
    const { filename, contentType } = req.body
    const key = `uploads/${uuidv4()}-${filename}`
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })
    const url = await getSignedUrl(s3, command, { expiresIn: 300 })
    res.json({ uploadUrl: url, key, publicUrl: `${process.env.CLOUDFRONT_DOMAIN}/${key}` })
  } catch (err) { next(err) }
})

module.exports = router
