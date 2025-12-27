const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { validateChapaPayment } = require('../utils/validator')
const controller = require('../controller/chapa.controller')

const router = express.Router()

router.use(helmet())
router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

router.post('/pay', (req, res, next) => {
  const { error } = validateChapaPayment(req.body)
  if (error) return res.status(400).json({ message: error.details[0].message })
  next()
}, controller.initiatePayment)

router.get('/verify', controller.verifyPayment)
router.post('/webhook', express.json(), controller.webhook)

module.exports = router
