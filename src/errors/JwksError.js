export default class JwksError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.message = message;
    this.name = 'JwksError';
  }

  toString () {
    return `${this.name}: ${this.message}`;
  }
}
