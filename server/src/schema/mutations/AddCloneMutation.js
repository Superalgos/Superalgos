import { CloneInputType } from '../types/input'
import { CloneType } from '../types'
import { Clone } from '../../models'
import { CloneModeEnum } from '../../enums/CloneMode'
import { BotTypesEnum } from '../../enums/BotTypes'
import teamQuery from '../../graphQLCalls/teamQuery'
import authorizeKey from '../../graphQLCalls/authorizeKey'
import cloneDetails from '../cloneDetails'
import {
  AuthenticationError,
  WrongArgumentsError,
  OperationsError,
  AuthorizationError
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
    throw new AuthenticationError()
  } else {
    clone.authorization = context.authorization
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

  // TODO Temporary Limitations on bot creation
  if (clone.accessCode !== undefined && clone.accessCode.length > 0) {
    if (clone.accessCode === process.env.ACCESS_CODE) {
      clone.balanceAssetA = Number(process.env.DEFAULT_BALANCE_ASSET_A)
    } else {
      throw new Error('Invalid access code.')
    }
  } else {
    clone.balanceAssetA = Number(process.env.DEFAULT_BALANCE_ASSET_A)
    clone.balanceAssetB = Number(process.env.DEFAULT_BALANCE_ASSET_B)
  }

  if (!(clone.teamSlug === "AAMasters" || clone.teamSlug === "AAVikings")) {
    let clones = await Clone.find({
      authId: context.userId,
      active: true
    })

    if (clones !== undefined && clones.length >= 5) {
      throw new Error('Currently maximum number of clones per user is 5. You can delete an existing clone and try again.')
    }
  }
  // END temporary limitations
  try {
    let newClone = new Clone(clone)
    newClone.authId = context.userId
    clone.id = newClone._id

    logger.debug('addClone -> Creating the clone on the Database.')
    let savedClone = await newClone.save()

    if (clone.mode === LIVE || clone.mode === COMPETITION) {
      logger.debug('addClone -> Authorizing clone to use the key.')

      let keyResponse = await authorizeKey(context.authorization, clone.keyId, clone.id, false)
      if (isDefined(keyResponse.data.data.keyVault_AuthorizeClone)) {
        clone.accessTokenKey = keyResponse.data.data.keyVault_AuthorizeClone
      } else {
        logger.error('addClone -> Authorizing clone to use the key fail.')
        throw new AuthorizationError()
      }
    }

    await createKubernetesClone(clone)

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
