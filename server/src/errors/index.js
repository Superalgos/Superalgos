export class AuthenticationError extends Error {
  constructor(message) {
    super(message)
    this.code = 401
    this.message = 'Autentification not found, you have to be authentificated to perform this action.'
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message)
    this.code = 401
    this.message = 'You are not authorized to perform this action.'
  }
}

export class WrongArgumentsError extends Error {
  constructor(message) {
    super(message)
    this.code = 400
    this.message = `Wrong arguments : ${this.message}`
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message)
    this.code = 503
    this.message = `At least one service is unresponding ${this.message}`
  }
}

export class OperationsError extends Error {
  constructor(message) {
    super(message)
    this.code = 500
    this.message = `OperationsModule Internal Error. ${this.message}`
  }
}

export class KubernateError extends Error {
  constructor(message) {
    super(message)
    this.code = 500
    this.message = `OperationsModule Kubernate Error. ${this.message}`
  }
}
