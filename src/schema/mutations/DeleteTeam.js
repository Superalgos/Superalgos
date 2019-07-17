import logger from '../../utils/logger'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import { TeamType } from '../types'
import { Ecosystem } from '../../models'
import { DeleteTeamInputType } from '../types/input'
import { deleteContainer } from '../../storage/providers/MinioStorage'

export const args = { team: { type: DeleteTeamInputType } }

const resolve = async (parent, { team }, context) => {
  logger.debug('deleteTeam -> Entering Function.')

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
    for (let i = 0; i < userEcosystem.devTeams.length; i++) {
      const auxTeam = userEcosystem.devTeams[i]
      if (auxTeam.codeName === team.codeName) {
        logger.debug('deleteTeam -> Team found, removing.')
        teamFound = true
        await deleteContainer(team.codeName)
        userEcosystem.devTeams.splice(i, 1)
        userEcosystem.markModified("devTeams")
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
