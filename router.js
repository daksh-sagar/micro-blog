const router = require('express').Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

const {
  home,
  register,
  login,
  requireLogin,
  logout,
  confirmEmail
} = userController
const { viewCreateScreen } = postController

router.get('/', home)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/confirm-email/:userId/:token', confirmEmail)

router.get('/create-post', requireLogin, viewCreateScreen)

module.exports = router
