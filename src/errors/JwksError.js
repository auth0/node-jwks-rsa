export class JwksError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'JwksError';
  }
}
