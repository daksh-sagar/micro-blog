const router = require('express').Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')

const {
  home,
  register,
  login,
  requireLogin,
  logout,
  confirmEmail,
  showUserProfile,
  sharedProfileData,
  showUserFollowers
} = userController
const {
  showCreateScreen,
  create,
  showSinglePost,
  showEditScreen,
  edit,
  deletePost,
  search
} = postController

const { addFollow, removeFollow } = followController

// user related routes
router.get('/', home)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/confirm-email/:userId/:token', confirmEmail)

// profile related routes
router.get('/profile/:username', sharedProfileData, showUserProfile)
router.get('/profile/:username/followers', sharedProfileData, showUserFollowers)
// router.get('/profile/:username/following', sharedProfileData, showUserFollowing)

// post related routes
router.get('/create-post', requireLogin, showCreateScreen)
router.post('/create-post', requireLogin, create)
router.get('/post/:postId/edit', requireLogin, showEditScreen)
router.get('/post/:postId', showSinglePost)
router.post('/post/:postId/edit', requireLogin, edit)
router.post('/post/:postId/delete', requireLogin, deletePost)
router.post('/search', search)

// follow related routes
router.post('/addFollow/:username', requireLogin, addFollow)
router.post('/removeFollow/:username', requireLogin, removeFollow)

module.exports = router
