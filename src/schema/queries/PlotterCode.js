import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  logger.debug('getPlotterCode -> Entering Function: ' + file.filePath)

  try {

    // TODO Temporary fix for plotter and plotter pannels
    if (file.storage === '' && file.accessKey === '') {
      let defaultEcosystem = require('../../config/ecosystem.json')
      for (let index = 0; index < defaultEcosystem.devTeams.length; index++) {
        const devTeam = defaultEcosystem.devTeams[index];
        if (devTeam.codeName.toLowerCase() === file.container) {
          file.storage = devTeam.host.storage
          file.accessKey = devTeam.host.accessKey
        }
      }
    }
    if (file.storage === '' || file.accessKey === '') {
      throw "Wrong parameters."
    }

    let storage = require('../../storage/providers/AzureStorage')
    let fileContent = await storage.getFileContentRemote(file.container, file.filePath, file.storage, file.accessKey)

    return fileContent

  } catch (err) {
    logger.error('getPlotterCode -> Error: %s', err.stack)
    throw err
  }
}

const query = {
  plotterCode: {
    type: GraphQLString,
    args,
    resolve,
  }
}

export default query
