const UserMongo = require('../../models/mongodb');

const getUser = async (req, res, next) => {
  if (!req.user) return next()
  const { sub, nickname } = req.user;
      return UserMongo.addUser({ authid: sub, alias: nickname })
  req.user = { token: req.user, ...user }
  next()
}

module.exports = getUser;
