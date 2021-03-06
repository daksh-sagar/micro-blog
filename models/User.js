const mongoose = require('mongoose')
const { isEmail, isAlphanumeric } = require('validator')
const argon2 = require('argon2')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    lowercase: true,
    trim: true,
    unique: true,
    minlength: [3, 'Username must contain atleast 3 characters'],
    validate: [
      {
        validator: value => isAlphanumeric(value),
        msg: 'Username can only contain alphabets and numbers'
      },
      {
        validator: async value => {
          const usernameCount = await mongoose.models.User.countDocuments({
            username: value
          })
          return !usernameCount
        },
        msg: 'Username address already taken'
      }
    ]
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,
    validate: [
      {
        validator: value => isEmail(value),
        msg: 'Invalid Email address'
      },
      {
        validator: async value => {
          const emailCount = await mongoose.models.User.countDocuments({
            email: value
          })
          return !emailCount
        },
        msg: 'Email address already taken'
      }
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must contain atleast 8 characters']
  },
  avatar: {
    type: String,
    required: true
  },
  isConfirmed: {
    type: Boolean,
    default: false
  }
})

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await argon2.hash(this.password)
  }

  next()
})

userSchema.statics.findUserByCredentials = async (email, password) => {
  const user = await mongoose.models.User.findOne({ email })
  if (!user) {
    throw new Error('No user found with the Email')
  }
  if (!user.isConfirmed) {
    throw new Error('You need to confirm your Email address to login')
  }
  const isMatch = await argon2.verify(user.password, password)
  if (!isMatch) {
    throw new Error('Incorrect password')
  }
  return user
}

userSchema.statics.findUserByUsername = async username => {
  const user = await mongoose.models.User.findOne({ username })

  if (!user) {
    throw new Error('No user found with given username')
  }

  return user
}

// userSchema.path('email').validate(async value => {
//   const emailCount = await mongoose.models.User.countDocuments({ email: value })
//   return !emailCount
// }, 'Email already exists')

const User = mongoose.model('User', userSchema)

module.exports = User
