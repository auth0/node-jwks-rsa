export default class JwksRateLimitError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.message = message;
    this.name = 'JwksRateLimitError';
  }

  toString () {
    return `${this.name}: ${this.message}`;
  }
}
