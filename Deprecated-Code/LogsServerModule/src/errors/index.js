class ClientError extends Error {
}


export class AuthentificationError extends ClientError {
  code = 401

  message = 'Autentification not found, you have to be authentificated to perform this action'
}

export class DatabaseError extends ClientError {
  code = 404

  message = `Ressource not found : ${this.message}`
}

export class WrongArgumentsError extends ClientError {
  code = 400

  message = `Wrong arguments : ${this.message}`
}
