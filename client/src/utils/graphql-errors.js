const ErrorResponse = {
  'unique constraint': 'Sorry, already taken! Please create a unique '
}

export const checkGraphQLError = error => {
  console.log('checkGraphQLError ', ErrorResponse)
  if (error.search(/unique constraint/)) {
    const field = error.substring(error.indexOf('=') + 1)
    console.log('unique constraint', field.replace(/ +/g, ''))
  }
}

export default checkGraphQLError
