import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'
import { writeFileContent } from '../../storage/providers/MinioStorage'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import getDevTeamHost from '../../utils/getDevTeamHost'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  try {
    if (file.accessKey === undefined || file.accessKey === null) {
      throw new WrongArgumentsError()
    }

    let host = await getDevTeamHost(file.container, undefined, file.accessKey)

    if (host === undefined || host === null) {
      throw new AuthenticationError()
    }
    let date = new Date()
    await writeFileContent(file.container, file.filePath, file.fileContent)
    let dateAfter = new Date()
    logger.info('createFile: ' + file.container + '/...' + file.filePath.substring(file.filePath.length -110 , file.filePath.length) + ', ' + (dateAfter - date))
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
