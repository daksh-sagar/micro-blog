const router = require('express').Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

const {
  home,
  register,
  login,
  requireLogin,
  logout,
  confirmEmail,
  showUserProfile
} = userController
const {
  showCreateScreen,
  create,
  showSinglePost,
  showEditScreen,
  edit,
  deletePost
} = postController

// user related routes
router.get('/', home)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/confirm-email/:userId/:token', confirmEmail)

// profile related routes
router.get('/profile/:username', showUserProfile)

// post related routes
router.get('/create-post', requireLogin, showCreateScreen)
router.post('/create-post', requireLogin, create)
router.get('/post/:postId/edit', requireLogin, showEditScreen)
router.get('/post/:postId', showSinglePost)
router.post('/post/:postId/edit', requireLogin, edit)
router.post('/post/:postId/delete', requireLogin, deletePost)

module.exports = router
