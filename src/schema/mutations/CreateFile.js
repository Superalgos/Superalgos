import logger from '../../utils/logger'
import { FileInputType } from '../types/input'
import { GraphQLString } from 'graphql'
import { writeFileContent } from '../../storage/providers/MinioStorage'

export const args = { file: { type: FileInputType } }

const resolve = async (parent, { file }, context) => {
  logger.debug('createFile -> Entering Function: ' + file.container + '/' + file.filePath)
  try {
    //TODO Add permissions
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
