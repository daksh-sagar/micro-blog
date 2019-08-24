const mongoose = require('mongoose')
const { isMongoId } = require('validator')
const sanitizeHTML = require('sanitize-html')

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post must have a Title'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Post must have some text'],
    trim: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

postSchema.pre('save', function(next) {
  const post = this
  post.title = sanitizeHTML(post.title, {
    allowedTags: [],
    allowedAttributes: {}
  })
  post.body = sanitizeHTML(post.body, {
    allowedTags: [],
    allowedAttributes: {}
  })
  next()
})

postSchema.statics.findSinglePostById = async function(postId) {
  if (!isMongoId(postId)) {
    throw new Error('Post not found ')
  }

  const post = await mongoose.models.Post.findById(postId).populate({
    path: 'author',
    select: 'username'
  })
  if (!post) {
    throw new Error('Post not found ')
  }

  return post
}

const Post = mongoose.model('Post', postSchema)

module.exports = Post
