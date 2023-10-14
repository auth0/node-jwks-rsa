export class SigningKeyNotFoundError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'SigningKeyNotFoundError';
  }
}
