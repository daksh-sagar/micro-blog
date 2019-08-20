const router = require('express').Router()
const userController = require('./controllers/userController')

const { home, register, login, logout, confirmEmail } = userController

router.get('/', home)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/confirm-email/:userId/:token', confirmEmail)

module.exports = router
