import { CloneInputType } from '../types/input'
import { CloneType } from '../types'
import { Clone } from '../../models'
import { BotTypesEnum } from '../../enums/BotTypes'
import teamQuery from '../../graphQLCalls/teamQuery'
import authorizeKey from '../../graphQLCalls/authorizeKey'
import addBotMutation from '../../graphQLCalls/addBotMutation'
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
import { CloneModeEnum, LIVE, COMPETITION, BACKTEST } from '../../enums/CloneMode'
import { Trading } from '../../enums/BotTypes'

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
      if (clone.baseAsset === 'assetB') {
        clone.balanceAssetA = 0
        clone.balanceAssetB = clone.balanceBaseAsset
      } else if (clone.baseAsset === 'assetA') {
        clone.balanceAssetA = clone.balanceBaseAsset
        clone.balanceAssetB = 0
      } else {
        throw new Error('Invalid base asset.')
      }
    } else {
      throw new Error('Invalid access code.')
    }
  } else {
    if (clone.baseAsset === 'assetB') {
      clone.balanceAssetA = 0
      clone.balanceAssetB = Number(process.env.DEFAULT_BALANCE_ASSET_B)
    } else if (clone.baseAsset === 'assetA') {
      clone.balanceAssetA = Number(process.env.DEFAULT_BALANCE_ASSET_A)
      clone.balanceAssetB = 0
    } else {
      throw new Error('Invalid base asset.')
    }
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

    if (clone.botType === Trading) {
      let productCodeName
      if (clone.mode === LIVE) {
        productCodeName = 'Live Trading History'
      }
      if (clone.mode === COMPETITION) {
        productCodeName = 'Competition Trading History'
      }
      if (clone.mode === BACKTEST) {
        productCodeName = 'Backtest Trading History'
      }

      let newEcosystemBot = {
        devTeam: clone.teamSlug,
        codeName: clone.botSlug,
        cloneId: clone.id,
        productCodeName
      }

      await addBotMutation(context.authorization, newEcosystemBot)
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
