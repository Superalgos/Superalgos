class ClientError extends Error {
  constructor(args) {
    super(args);
  }
}

class ServerError extends Error {
  constructor(args) {
    super(args);
  }
}

export class AuthenticationError extends ClientError {
  // code = 401
  // message = 'Authentication not found, you have to be authenticated to perform this action'
}

export class DatabaseError extends ClientError {
  // code = 404
  // message = `Ressource not found : ${this.message}`
}

export class WrongArgumentsError extends ClientError {
  // code = 400
  // message = `Wrong arguments : ${this.message}`
}

export class ServiceUnavailableError extends ServerError {
  // code = 503
  // message = `At least one service is unresponding ${this.message}`
}
