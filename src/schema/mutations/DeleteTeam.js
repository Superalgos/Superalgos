import logger from '../../utils/logger'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import { TeamType } from '../types'
import { Ecosystem } from '../../models'
import { TeamInputType } from '../types/input'
import { deleteTeam } from '../../storage/DeleteTeam'

export const args = { team: { type: TeamInputType } }

const resolve = async (parent, { team }, context) => {
  logger.debug('deleteTeam -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthenticationError()
  }

  try {
    let userEcosystem = await Ecosystem.findOne({
      authId: context.userId
    })

    if (!userEcosystem) {
      logger.debug('deleteTeam -> Ecosystem not found for the user.')
      throw new WrongArgumentsError('The user does not have an ecosystem configured.')
    }

    let teamFound = false
    for (let i = 0; i < userEcosystem.teams.length; i++) {
      const auxTeam = userEcosystem.teams[i]
      if (auxTeam.codeName === team.codeName) {
        logger.debug('deleteTeam -> Team found, removing.')
        teamFound = true
        await deleteTeam(team)
        userEcosystem.teams.splice(i, 1)
        await userEcosystem.save()
        break
      }
    }

    if (!teamFound) {
      throw new WrongArgumentsError('Team was not found on the user ecosystem.')
    } else {
      return team
    }

  } catch (err) {
    logger.error('deleteTeam -> Error: %s', err.stack)
    throw err
  }
}

const mutation = {
  deleteTeam: {
    type: TeamType,
    args,
    resolve,
  }
}

export default mutation;
