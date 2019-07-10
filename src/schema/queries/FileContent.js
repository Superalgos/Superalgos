import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'
import { getFileContent } from '../../storage/providers/MinioStorage'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import getDevTeamHost from '../../utils/getDevTeamHost'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  try {
    if (file.accessKey === undefined || file.accessKey === null) {
      throw new WrongArgumentsError()
    }

    let host = await getDevTeamHost(file.container, file.accessKey)

    if (host === undefined || host === null) {
      throw new AuthenticationError()
    }

    let date = new Date()
    let fileContent = await getFileContent(file.container, file.filePath)
    let dateAfter = new Date()
    logger.info('getFileContent: ' + file.container + '/...' + file.filePath.substring(file.filePath.length -110 , file.filePath.length) + ', ' + (dateAfter - date))
    return fileContent

  } catch (err) {
    if (err.message === 'The specified key does not exist.')
      logger.debug('getFileContent -> Error: %s', err.message)
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
