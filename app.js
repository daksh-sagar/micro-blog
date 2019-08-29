const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')

const router = require('./router')

const app = express()

const sessionOptions = session({
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true // cant be accessed via clients JS
  }
})

app.use(sessionOptions)
app.use(flash())
app.use((req, res, next) => {
  // make markdown func. available inside templates
  res.locals.filterUserHTML = content => {
    return markdown(content) // returns parsed markdown as HTML
  }

  res.locals.user = req.session.user
  next()
})
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(router)

const server = http.createServer(app)

const io = socketio(server)

io.use((socket, next) => {
  sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', socket => {
  if (socket.request.session.user) {
    const { user } = socket.request.session
    socket.emit('welcome', { username: user.username })
    socket.on('chatMessageFromBrowser', data => {
      socket.broadcast.emit('chatMessageFromServer', {
        message: sanitizeHTML(data.message, {
          allowedTags: [],
          allowedAttributes: {}
        }),
        username: user.username
      })
    })
  }
})

module.exports = server
