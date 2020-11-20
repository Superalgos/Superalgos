export const createMember = async function (ctx, info, authId) {
  logger.info('createMember', authId)
  const member = await ctx.db.mutation.upsertMember({
    where: {
      authId: authId,
    },
    create: {
      authId: authId,
      alias: idToken.nickname
    },
    update: {
      authId: authId,
      alias: idToken.nickname
    }
  }, info)
  return member
}
