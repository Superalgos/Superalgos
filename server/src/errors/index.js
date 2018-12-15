import { ApolloError } from 'apollo-server-express'
import { inspect } from 'util'
import logger from '../logger'

export {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
  SyntaxError,
  UserInputError,
  ValidationError,
} from 'apollo-server-express'

export const formatError = (error) => {
  // This can be used to send errors to third
  // party services like Sentry or Stackdriver
  logger.info('formatError')
  logger.error(JSON.parse(JSON.stringify(inspect(error))))
  const originalError = searchOriginalError(error)
  logger.error('originalError')
  logger.error(originalError)
  const { message, code } = originalError
  return { message, code}
}

const searchOriginalError = (error) => {
  if (error.originalError) {
    logger.error('Original Error')
    logger.error(error.originalError)
    return error.originalError
  }
  if (error.errors) {
    logger.error('Errors')
    logger.error(JSON.parse(JSON.stringify(inspect(error.errors))))
    return error.errors.map(searchOriginalError)[0]
  }
  logger.error('searchOriginalErrors')
  logger.error(JSON.parse(JSON.stringify(inspect(error))))
  return error;
}

// Define custom Apollo errors here
export class ExternalServiceError extends ApolloError {
  constructor(message) {
    super(message, 'EXTERNAL_SERVICE_UNAVAILABLE')

    Object.defineProperty(this, 'name', { value: this.constructor.name })
  }
}
