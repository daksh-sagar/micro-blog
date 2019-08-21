const Post = require('../models/Post')
const { formatValidationErrors } = require('../utils/index')

exports.viewCreateScreen = (req, res) => {
  res.render('create-post', {
    postFormErrors: req.flash('postFormErrors')
  })
}

exports.create = async (req, res) => {
  const { title, body } = req.body
  try {
    const post = await Post.create({
      title,
      body,
      author: req.session.user.id
    })

    res.send(post)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = formatValidationErrors(error)
      errors.forEach(err => {
        req.flash('postFormErrors', err)
      })
      await req.session.save()
      return res.redirect('/create-post')
    }

    res.status(500).send(error.message)
  }
}
