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
const { viewCreateScreen, create, showSinglePost } = postController

// user related routes
router.get('/', home)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/confirm-email/:userId/:token', confirmEmail)

// post related routes
router.get('/create-post', requireLogin, viewCreateScreen)
router.post('/create-post', requireLogin, create)
router.get('/post/:postId', showSinglePost)

module.exports = router
