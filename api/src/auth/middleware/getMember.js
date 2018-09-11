const getMember = async (req, res, next, db) => {
  if (!req.user) return next()
  const member = await db.query.member({
    where: { auth0id: req.user.sub }
  })
  req.user = { token: req.user, ...member }
  next()
}

module.exports = { getMember }
