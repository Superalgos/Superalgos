export class AuthentificationError extends Error {
  code = 401
  message = 'You have to be authentificated to ' + ( this.message || "perform this action")
}
