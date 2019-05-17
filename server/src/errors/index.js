export class AuthentificationError extends Error {
  code = 401
  message = 'Autentification not found, you have to be authentificated to perform this action.'
  constructor(){
    super()
  }
}

export class AuthorizationError extends Error {
  code = 401
  message = 'You are not authorized to perform this action.'
  constructor(){
    super()
  }
}

export class DatabaseError extends Error {
  code = 404
  message = 'Ressource not found : ' + this.message
  constructor(message){
    super(message)
  }
}

export class WrongArgumentsError extends Error {
  code = 400
  message = 'Wrong arguments : ' + this.message
  constructor(message){
    super(message)
  }
}

export class ServiceUnavailableError extends Error {
  code = 503
  message = 'At least one service is unresponding ' + this.message
  constructor(message){
    super(message)
  }
}

export class OperationsError extends Error {
  code = 500
  message = 'OperationsModule Internal Error. ' + this.message
  constructor(message){
    super(message)
  }
}

export class KubernateError extends Error {
  code = 500
  message = 'OperationsModule Kubernate Error. ' + this.message
  constructor(message){
    super(message)
  }
}
