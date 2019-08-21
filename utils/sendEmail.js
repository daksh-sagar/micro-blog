const nodemailer = require('nodemailer')

const sendEmail = async options => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  const mailOptions = {
    from: 'Micto Blog <hello@microblog.com>',
    to: options.email,
    subject: options.subject,
    text: options.message //TODO: swap this out with HTML
  }

  await transport.sendMail(mailOptions)
}

module.exports = sendEmail
