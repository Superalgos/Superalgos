import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  logger.debug('getFileContent -> Entering Fuction: ' + file.filePath)

  try {

    let storage = require('../../storage/providers/AzureStorage') // Default value
    if (process.env.STORAGE_PROVIDER === 'Minio') {
      storage = require('../storage/providers/MinioStorage')
    }

    return storage.getFileContentRemote(file.container, file.filePath, file.storage, file.accessKey)

  } catch (err) {
    logger.error('getFileContent -> Error: %s', err.stack)
    throw err
  }
}

const query = {
  fileContent: {
    type: GraphQLString,
    args,
    resolve,
  }
}

export default query
