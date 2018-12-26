import { CloneInputType } from '../types/input';
import { CloneType } from '../types';
import { Clone } from '../../models';
import { CloneModeEnum , BACKTEST} from '../../enums/CloneMode';

import {
  AuthentificationError,
  WrongArgumentsError,
  OperationsError,
  CustomError
} from '../../errors'

import axios from 'axios';
import logger from '../../config/logger'
import createKubernetesClone from '../../kubernetes/createClone'
import { isDefined } from '../../config/utils'

const args = {
  clone: {type: CloneInputType }
}

const resolve = async(parent, { clone }, context) => {
  logger.debug('addClone -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthentificationError()
  }

  if(!Object.values(CloneModeEnum).includes(clone.mode)){
    throw new WrongArgumentsError('The mode selected is not valid.')
  }

  // Disable execution dates if mode is not backtest
  if((clone.hasOwnProperty('beginDatetime')
      || clone.hasOwnProperty('endDatetime'))
    && clone.mode !== BACKTEST){
    throw new WrongArgumentsError('Ony Backtest mode allows begin and end date selection.')
  }

  let existingClone = await Clone.find(
    {
      authId: context.userId,
      mode: clone.mode
    })

  logger.debug('addClone -> Checking existing clone %j', existingClone)
  if(isDefined(existingClone) && existingClone.length > 0){
    throw new CustomError('You can only create one clone per mode. Remove the'
      + ' existing clone of type: ' + clone.mode + ' and try again.')
  }

  logger.debug('addClone -> Creating a new clone. %j', clone)

  try{
    const userTeam = await axios({
      url: process.env.GATEWAY_ENDPOINT,
      method: 'post',
      data: {
        query: `
        query Teams_FbByTeamMember {
          teams_FbByTeamMember {
            id
            name
            slug
            fb {
              id
              name
              slug
            }
            members {
              member {
                alias
              }
            }
          }
        }
        `,
      },
      headers: {
        authorization: context.authorization,
        preshared: process.env.OPERATIONS_API_PRESHARED
      }
    })

    clone.teamId = userTeam.data.data.teams_FbByTeamMember.slug
    clone.botId = userTeam.data.data.teams_FbByTeamMember.fb[0].slug
    clone.userLoggedIn = userTeam.data.data.teams_FbByTeamMember.members[0].member.alias
    clone.createDatetime = new Date().valueOf() / 1000|0

    let newClone = new Clone(clone)

    await createKubernetesClone(clone, newClone._id)

    newClone.id = newClone._id
    newClone.authId = context.userId

    return new Promise((resolve, reject) => {
      newClone.save((err) => {
        if (err){
          logger.debug('addClone -> Error: %j', err)
          reject('There has been an error storing the clone.')
        }
        else {
          //TODO transaction on database
          // saveAuditLog(newClone.id, 'addKey', context)
          logger.debug('addClone -> Save clone sucessful.')
          resolve(newClone)
        }
      })
    })
  } catch(error) {
    logger.debug('addClone -> Error: %j', error)
    throw new OperationsError('There has been an error creating the clone.')
  }
}

const mutation = {
  addClone: {
    type: CloneType,
    args,
    resolve
  }
}

export default mutation
