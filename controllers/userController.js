const User = require('../models/User')

const formatValidationErrors = error => {
  const errors = []
  Object.keys(error.errors).forEach(key => {
    errors.push(error.errors[key].message)
  })
  return errors
}

exports.home = (req, res) => {
  if (req.session.user) {
    res.render('home-dashboard', { username: req.session.user.username })
  } else {
    res.render('home-guest', {
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

    res.send(user)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = formatValidationErrors(error)
      errors.forEach(err => {
        req.flash('regErrors', err)
      })
      await req.session.save()
      return res.redirect('/')
    }

    res.status(500).send('Something went very wrong !')
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
