export default class SigningKeyNotFoundError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.message = message;
    this.name = 'SigningKeyNotFoundError';
  }

  toString () {
    return `${this.name}: ${this.message}`;
  }
}
