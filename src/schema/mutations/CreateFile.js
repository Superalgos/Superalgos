import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'
import { writeFileContent } from '../../storage/providers/MinioStorage'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import getDevTeamHost from '../../utils/getDevTeamHost'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  logger.debug('createFile -> Entering Function: ' + file.container + '/' + file.filePath)
  try {
    if (file.accessKey === undefined || file.accessKey === null) {
      throw new WrongArgumentsError()
    }

    let host = await getDevTeamHost(file.container, undefined, file.accessKey)

    if (host === undefined || host === null) {
      throw new AuthenticationError()
    }

    await writeFileContent(file.container, file.filePath, file.fileContent)
    return 'File created.'
  } catch (err) {
    logger.error('createFile -> Error: %s', err.message)
    throw err
  }
}

const mutation = {
  createFile: {
    type: GraphQLString,
    args,
    resolve,
  }
}

export default mutation;
