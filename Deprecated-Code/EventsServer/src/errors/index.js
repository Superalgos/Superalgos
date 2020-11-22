import * as Sentry from '@sentry/node';

class ClientError extends Error {
  constructor(args) {
    super(args);
    Sentry.configureScope((scope) => {
      scope.setLevel('debug');
    });
    Sentry.captureException(this);
  }
}

class ServerError extends Error {
  constructor(args) {
    super(args);
    Sentry.configureScope((scope) => {
      scope.setLevel('error');
    });
    Sentry.captureException(this);
  }
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

export class NotImplementedYetError extends ServerError {
  code = 501

  message = `This is not implemented yet, but will be soon. ${this.message}`
}

export class ServiceUnavailableError extends ServerError {
  code = 503

  message = `At least one service is unresponding ${this.message}`
}
