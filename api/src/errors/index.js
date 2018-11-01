import { ApolloError } from 'apollo-server-express'
import { logger } from '../logger'

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
  logger.error(JSON.stringify(error))
  const originalError = searchOriginalError(error)
  logger.error(originalError)
  return originalError
}

const searchOriginalError = (error) => {
  if (error.originalError) {
    return searchOriginalError(error.originalError)
  }
  if (error.errors) {
    return error.errors.map(searchOriginalError)[0]
  }
  return error;
}

// Define custom Apollo errors here
export class ExternalServiceError extends ApolloError {
  constructor(message) {
    super(message, 'EXTERNAL_SERVICE_UNAVAILABLE')

    Object.defineProperty(this, 'name', { value: this.constructor.name })
  }
}
