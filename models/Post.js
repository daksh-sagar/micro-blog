const mongoose = require('mongoose')

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

const Post = mongoose.model('Post', postSchema)

module.exports = Post
