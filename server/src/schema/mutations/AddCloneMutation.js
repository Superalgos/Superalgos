import { CloneInputType } from '../types/input'
import { CloneType } from '../types'
import { Clone } from '../../models'
import { CloneModeEnum } from '../../enums/CloneMode'
import { BotTypesEnum } from '../../enums/BotTypes'
import teamQuery from '../../graphQLCalls/teamQuery'
import authorizeClone from '../../graphQLCalls/authorizeClone'
import cloneDetails from '../cloneDetails'
import {
  AuthentificationError,
  WrongArgumentsError,
  OperationsError,
  AutorizationError
} from '../../errors'
import logger from '../../config/logger'
import createKubernetesClone from '../../kubernetes/createClone'
import { isDefined } from '../../config/utils'
import { LIVE, COMPETITION } from '../../enums/CloneMode'

const args = {
  clone: { type: CloneInputType }
}

const resolve = async (parent, { clone }, context) => {
  logger.debug('addClone -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthentificationError()
  }

  if (!Object.values(CloneModeEnum).includes(clone.mode)) {
    throw new WrongArgumentsError('The mode selected is not valid.')
  }

  if (!Object.values(BotTypesEnum).includes(clone.botType)) {
    throw new WrongArgumentsError('The bot type selected is not valid.')
  }

  if ((clone.mode === LIVE || clone.mode === COMPETITION) && !isDefined(clone.keyId)) {
    throw new WrongArgumentsError('The key was not provided to run the clone.')
  }

  let allUserBotsResponse = await teamQuery(context.authorization, clone.botId)
  let bot = allUserBotsResponse.data.data.teams_FbByOwner.edges[0].node
  clone = cloneDetails(bot, clone)
  clone.createDatetime = new Date().valueOf() / 1000 | 0
  clone.active = true

  // TODO Temporary Limitation on bot creation
  if (!(clone.teamSlug === "AAMasters" || clone.teamSlug === "AAVikings")) {
    let clones = await Clone.find({
      authId: context.userId,
      active: true
    })

    if (clones !== undefined && clones.length >= 5) {
      throw new Error('Currently maximum number of clones per user is 5. You can delete an existing clone and try again.')
    }
  }

  try {
    let newClone = new Clone(clone)
    newClone.authId = context.userId
    clone.id = newClone._id

    logger.debug('addClone -> Creating the clone on the Database.')
    let savedClone = await newClone.save()

    if (clone.mode === LIVE || clone.mode === COMPETITION) {
      logger.debug('addClone -> Authorizing clone to use the key.')
      let response = await authorizeClone(context.authorization, clone.keyId, clone.id, false)
      logger.debug('addClone -> Authorizing clone to use the key.')
      if (response.data.data.keyVault_AuthorizeClone === clone.keyId) {
        await createKubernetesClone(clone)
      } else {
        throw new AutorizationError()
      }
    } else {
      await createKubernetesClone(clone)
    }

    logger.debug('addClone -> Clone created sucessfully.')
    return savedClone
  } catch (err) {
    logger.error('addClone -> Error: %s', err.stack)
    throw new OperationsError('There has been an error creating the clone.')
  }
}

const AddCloneMutation = {
  addClone: {
    type: CloneType,
    args,
    resolve
  }
}

export default AddCloneMutation
