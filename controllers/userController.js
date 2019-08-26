const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')
const sendEmail = require('../utils/sendEmail')

const { formatValidationErrors } = require('../utils/index')

const generateConfirmationLink = userId => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '12h'
  })

  return `http://localhost:5000/confirm-email/${userId}/${token}`
}

exports.home = (req, res) => {
  if (req.session.user) {
    res.render('home-dashboard', { username: req.session.user.username })
  } else {
    res.render('home-guest', {
      regSuccess: req.flash('regSuccess'),
      emailConfirmed: req.flash('emailConfirmed'),
      errors: req.flash('errors'),
      regErrors: req.flash('regErrors')
    })
  }
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body
  try {
    const user = await User.create({
      username,
      email,
      password
    })

    const confirmationLink = generateConfirmationLink(user.id)

    await sendEmail({
      email: user.email,
      subject: 'Confirm your Email address',
      message: `Click on this link to activate your email address ${confirmationLink}`
    })
    req.flash(
      'regSuccess',
      'Please check your inbox for confirmation Email. Click the link in the email to confirm your Email address'
    )
    await req.session.save()
    res.redirect('/')
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = formatValidationErrors(error)
      errors.forEach(err => {
        req.flash('regErrors', err)
      })
      await req.session.save()
      return res.redirect('/')
    }

    res.status(500).send(error.message)
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findUserByCredentials(email, password)
    req.session.user = {
      id: user.id,
      username: user.username
    }
    await req.session.save()
    res.redirect('/')
  } catch (error) {
    req.flash('errors', error.message)
    await req.session.save()
    res.redirect('/')
  }
}

exports.logout = async (req, res) => {
  await req.session.destroy()
  res.redirect('/')
}

exports.confirmEmail = async (req, res) => {
  const { userId, token } = req.params
  try {
    if (!userId || !token) {
      throw new Error('The link is not valid')
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.userId === userId) {
      await User.findByIdAndUpdate(userId, { isConfirmed: true })
    }

    req.flash(
      'emailConfirmed',
      'Your Email has been verified. You can now login'
    )
    await req.session.save()
    res.redirect('/')
  } catch (error) {
    res.status(400).send(error.message)
  }
}

exports.requireLogin = async (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    req.flash('errors', 'You must be logged in to perform that action')
    await req.session.save()
    res.redirect('/')
  }
}

exports.showUserProfile = async (req, res) => {
  try {
    const user = await User.findUserByUsername(req.params.username)
    const posts = await Post.find({ author: user.id }).sort({ createdDate: -1 })
    res.render('profile', {
      profileUsername: user.username,
      posts,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      success: req.flash('success')
    })
  } catch (error) {
    res.render(404)
  }
}

exports.sharedProfileData = async (req, res, next) => {
  let isFollowing = false
  let isVisitorsProfile = false

  if (req.params.username === req.session.user.username) {
    isVisitorsProfile = true
  }

  if (req.session.user) {
    isFollowing = await Follow.isVisitorFollowing(
      req.params.username,
      req.session.user.id
    )
  }

  req.isFollowing = isFollowing
  req.isVisitorsProfile = isVisitorsProfile
  next()
}

exports.showUserFollowers = async (req, res) => {
  try {
    const user = await User.findUserByUsername(req.params.username)
    const followers = await Follow.find({
      followed: user.id // the user's whose profile is being visited, find his followers
    }).populate({
      path: 'author', // the user who followed
      select: 'username'
    })

    console.log(followers)

    res.render('profile-followers', {
      profileUsername: user.username,
      followers,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      success: req.flash('success')
    })
  } catch (error) {
    res.render('404')
  }
}
