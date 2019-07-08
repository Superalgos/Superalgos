import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'
import { getFileContent } from '../../storage/providers/MinioStorage'
import { getFileContentRemote } from '../../storage/providers/AzureStorage'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import getDevTeamHost from '../../utils/getDevTeamHost'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  logger.debug('getFileContent -> Entering Function: ' + file.container + '/' + file.filePath)

  try {
    if (file.accessKey === undefined || file.accessKey === null) {
      throw new WrongArgumentsError()
    }

    let host = await getDevTeamHost(file.container, file.accessKey)

    if (host === undefined || host === null) {
      throw new AuthenticationError()
    }

    let fileContent
    if (file.storage === 'localStorage') {
      fileContent = await getFileContent(file.container, file.filePath)
    } else {
      fileContent = await getFileContentRemote(file.container, file.filePath, file.storage, file.accessKey)
    }

    return fileContent

  } catch (err) {
    if (err.message === 'The specified key does not exist.')
      logger.warn('getFileContent -> Error: %s', err.message)
    else {
      logger.error('getFileContent -> Error: %s', err.message)
      throw err
    }
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
