const getMember = async (req, res, next, db) => {
  if (!req.user) return next()
  const member = await db.query.member({
    where: { authId: req.user.sub }
  })
  req.user = { user: member }
  next()
}

module.exports = { getMember }
