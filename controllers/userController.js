const User = require('../models/User')

exports.home = (req, res) => {
  if (req.session.user) {
    res.render('home-dashboard', { username: req.session.user.username })
  } else {
    res.render('home-guest')
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

    res.send(user)
  } catch (error) {
    res.send(error.message)
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
    res.send(user)
  } catch (error) {
    res.send(error.message)
  }
}
