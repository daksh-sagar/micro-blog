const mongoose = require('mongoose')

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv')
  dotenv.config()
}

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    const app = require('./app')
    app.listen(process.env.PORT)
  })
  .catch(error => {
    console.error(error.message)
  })
