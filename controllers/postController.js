const Post = require('../models/Post')
const { formatValidationErrors } = require('../utils/index')

exports.showCreateScreen = (req, res) => {
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

    res.redirect(`/post/${post.id}`)
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

exports.showSinglePost = async (req, res) => {
  const { postId } = req.params

  try {
    const post = await Post.findSinglePostById(postId)
    res.render('post', { post })
  } catch (error) {
    res.status(404).render('404')
  }
}

exports.showEditScreen = async (req, res) => {
  const { postId } = req.params

  try {
    const post = await Post.findSinglePostById(postId)

    // check for permissions
    if (post.author.id !== req.session.user.id) {
      // req.flash('errors', 'You do not have permissions to perform that action')
      // await req.session.save()
      return res.redirect(`/post/${postId}`)
    }

    res.render('edit-post', {
      post,
      postFormErrors: req.flash('postFormErrors')
    })
  } catch (error) {
    res.status(404).render('404')
  }
}

exports.edit = async (req, res) => {
  const { postId } = req.params
  const { title, body } = req.body
  try {
    const post = await Post.findSinglePostById(postId)

    // check for permissions
    if (post.author.id !== req.session.user.id) {
      req.flash('errors', 'You do not have permissions to perform that action')
      await req.session.save()
      return res.redirect('/')
    }

    // Otherwise update the post. (explicit update is done to run pre save middleware)
    post.title = title
    post.body = body
    await post.save()
    res.redirect(`/post/${post.id}`)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = formatValidationErrors(error)
      errors.forEach(err => {
        req.flash('postFormErrors', err)
      })
      await req.session.save()
      return res.redirect(`/post/${postId}/edit`)
    }

    res.status(500).send(error.message)
  }
}

exports.deletePost = async (req, res) => {
  const { postId } = req.params
  try {
    const post = await Post.findSinglePostById(postId)

    // check for permissions
    if (post.author.id !== req.session.user.id) {
      req.flash('errors', 'You do not have permissions to perform that action')
      await req.session.save()
      return res.redirect('/')
    }

    await post.delete()
    res.redirect(`/profile/${req.session.user.username}`)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

exports.search = async (req, res) => {
  const { searchTerm } = req.body

  try {
    const results = await Post.aggregate([
      { $match: { $text: { $search: searchTerm } } },
      { $sort: { score: { $meta: 'textScore' } } }
    ])
    return res.status(200).json(results)
  } catch (error) {
    res.status(500).send('Something went wrong')
  }
}
