const Follow = require('../models/Follow')

exports.addFollow = async (req, res) => {
  try {
    await Follow.follow(req.params.username, req.session.user.id)
    req.flash('success', `You are now following ${req.params.username}`)
    await req.session.save()

    res.redirect(`/profile/${req.params.username}`)
  } catch (error) {
    req.flash('errors', error.message)
    await req.session.save()

    res.redirect(`/`)
  }
}
