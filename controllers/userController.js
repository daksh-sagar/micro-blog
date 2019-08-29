const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')
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

exports.home = async (req, res) => {
  if (req.session.user) {
    const posts = await Post.getFeed(req.session.user.id)
    res.render('home-dashboard', { username: req.session.user.username, posts })
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
  const avatar = gravatar.url(email, {
    s: '200',
    r: 'pg',
    d: 'mm'
  })
  try {
    const user = await User.create({
      username,
      email,
      password,
      avatar
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
      username: user.username,
      avatar: user.avatar
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

  // retrieve posts, followers and following count
  const user = await User.findUserByUsername(req.params.username)
  const postCountPromise = Post.countDocuments({ author: user.id })
  const followerCountPromise = Follow.countDocuments({ followed: user.id })
  const followingCountPromise = Follow.countDocuments({ author: user.id })

  const [postCount, followerCount, followingCount] = await Promise.all([
    postCountPromise,
    followerCountPromise,
    followingCountPromise
  ])

  req.authorId = user.id
  req.username = user.username
  req.avatar = user.avatar
  req.postCount = postCount
  req.followerCount = followerCount
  req.followingCount = followingCount

  next()
}

exports.showUserProfile = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.authorId }).sort({
      createdDate: -1
    })
    res.render('profile', {
      title: `${req.username}'s Profile`,
      profileUsername: req.username,
      profileAvatar: req.avatar,
      currentPage: 'posts',
      posts,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount
      },
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      success: req.flash('success')
    })
  } catch (error) {
    res.render(404)
  }
}

exports.showUserFollowers = async (req, res) => {
  try {
    const user = await User.findUserByUsername(req.params.username)
    const followers = await Follow.find({
      followed: user.id // the user's whose profile is being visited, find his followers
    }).populate({
      path: 'author', // the user who followed
      select: 'username avatar'
    })

    console.log(followers)

    res.render('profile-followers', {
      profileUsername: user.username,
      profileAvatar: user.avatar,
      currentPage: 'followers',
      followers,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount
      },
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      success: req.flash('success')
    })
  } catch (error) {
    res.render('404')
  }
}

exports.showUserFollowing = async (req, res) => {
  try {
    const user = await User.findUserByUsername(req.params.username)
    const following = await Follow.find({
      author: user.id // the user's whose profile is being visited, find the guys he is following
    }).populate({
      path: 'followed', // the user who is being followed
      select: 'username avatar'
    })

    res.render('profile-following', {
      profileUsername: user.username,
      profileAvatar: user.avatar,
      currentPage: 'following',
      following,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount
      },
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      success: req.flash('success')
    })
  } catch (error) {
    res.render('404')
  }
}
