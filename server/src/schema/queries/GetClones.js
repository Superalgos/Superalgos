import {
  GraphQLList,
  GraphQLID
} from 'graphql'

import {
  OperationsError
} from '../../errors'

import { GetClonesInputType } from '../types/input';
import { GetClonesType } from '../types'
import { Clone } from '../../models'
import logger from '../../config/logger'

import { isDefined } from '../../config/utils'

const args = {
  cloneIdList: {type: GetClonesInputType}
}

const resolve = async(parent, { cloneIdList }, context) => {
  logger.debug('Get Clones -> Entering Fuction. %j', cloneIdList)
  try{
     let clones = []
     for (var i = 0; i < cloneIdList.cloneIdList.length; i++) {
       let existingClone = await Clone.findOne({
         _id: cloneIdList.cloneIdList[i]
       })

       if(isDefined(existingClone)){
         clones.push({
           id: cloneIdList.cloneIdList[i],
           teamId: existingClone.teamId,
           botId: existingClone.botId
         })
       }

     }

     return clones
 } catch (err){
    logger.error('Get Clones error: %s', err.stack)
    throw new OperationsError('There has been an error getting the clones.')
 }
}

const query = {
  getClones: {
    type: new GraphQLList(GetClonesType),
    args,
    resolve
  }
}

export default query
