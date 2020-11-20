export class AuthentificationError extends Error {
  code = 401

  message = 'Autentification not found, you have to be authentificated to perform this action'
}

export class DatabaseError extends Error {
  code = 404

  message = `Ressource not found : ${this.message}`
}

export class WrongArgumentsError extends Error {
  code = 400

  message = `Wrong arguments : ${this.message}`
}

export class ServiceUnavailableError extends Error {
  code = 503

  message = `At least one service is unresponding ${this.message}`
}
