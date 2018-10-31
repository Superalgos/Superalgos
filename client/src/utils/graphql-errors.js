import log from './log'

const ErrorResponse = {
  'unique constraint': 'Sorry, already taken! Please create a unique '
}

export const checkGraphQLError = error => {
  log.debug('checkGraphQLError ', ErrorResponse)
  if (error.search(/unique constraint/)) {
    const field = error.substring(error.indexOf('=') + 1)
    log.debug('unique constraint', field.replace(/ +/g, ''))
  }
}

export default checkGraphQLError
