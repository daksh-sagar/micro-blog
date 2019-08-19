const router = require('express').Router()
const userController = require('./controllers/userController')

const { home, register, login, logout } = userController

router.get('/', home)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

module.exports = router
