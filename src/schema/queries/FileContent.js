import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'
import { getFileContent } from '../../storage/providers/MinioStorage'
import { getFileContentRemote } from '../../storage/providers/AzureStorage'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  logger.debug('getFileContent -> Entering Function: ' + file.container + '/' + file.filePath)

  try {

    let fileContent
    if (file.storage === 'localStorage') {
      //TODO Add permissions
      fileContent = await getFileContent(file.container, file.filePath)
    } else {
      fileContent = await getFileContentRemote(file.container, file.filePath, file.storage, file.accessKey)
    }

    return fileContent

  } catch (err) {
    if(err.message === 'The specified key does not exist.')
      logger.warn('getFileContent -> Error: %s', err.message)
    else
    logger.error('getFileContent -> Error: %s', err.message)
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
