const router = require('express').Router()
const userController = require('./controllers/userController')

const { home, register, login } = userController

router.get('/', home)
router.post('/register', register)
router.post('/login', login)

module.exports = router
