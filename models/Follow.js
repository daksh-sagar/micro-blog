const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
  followed: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  }
})

followSchema.statics.follow = async function(followedUsername, authorId) {
  const followedAccount = await mongoose.models.User.findOne({
    username: followedUsername
  })

  if (!followedAccount) {
    throw new Error('You can not follow a user that does not exist.')
  }

  await mongoose.models.Follow.create({
    followed: followedAccount.id,
    author: authorId
  })
}

const Follow = mongoose.model('Follow', followSchema)

module.exports = Follow
