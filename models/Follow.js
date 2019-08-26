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

  if (followedAccount.id === authorId) {
    throw new Error('You can not follow yourself')
  }

  const isAlreadyFollowing = await mongoose.models.Follow.findOne({
    followed: followedAccount.id,
    author: authorId
  })

  if (isAlreadyFollowing) {
    throw new Error('You are already following this user')
  }

  await mongoose.models.Follow.create({
    followed: followedAccount.id,
    author: authorId
  })
}

followSchema.statics.unFollow = async function(followedUsername, authorId) {
  const followedAccount = await mongoose.models.User.findOne({
    username: followedUsername
  })

  if (!followedAccount) {
    throw new Error('You can not unfollow a user that does not exist.')
  }

  const follow = await mongoose.models.Follow.findOne({
    followed: followedAccount.id,
    author: authorId
  })

  if (!follow) {
    throw new Error('To unfollow, you must follow the user first')
  }

  await follow.delete()
}

followSchema.statics.isVisitorFollowing = async function(
  followedUsername,
  authorId
) {
  const followedAccount = await mongoose.models.User.findOne({
    username: followedUsername
  })

  const follow = await mongoose.models.Follow.findOne({
    followed: followedAccount.id,
    author: authorId
  })

  if (follow) return true

  return false
}

const Follow = mongoose.model('Follow', followSchema)

module.exports = Follow
