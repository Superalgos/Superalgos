/*
We check here if the User that have just logged in or signed up already exists at
the Mongo DB Database or not. If now then we should create it with the minimun
set of information available.
*/

const UserMongo = require('./add-user')

const getUser = async (req, res, next) => {
  if (!req.user) return next()
  const { sub, nickname } = req.user
  return UserMongo.addUser({ authid: sub, alias: nickname })
  req.user = { token: req.user, ...user }
  next()
}

module.exports = getUser
