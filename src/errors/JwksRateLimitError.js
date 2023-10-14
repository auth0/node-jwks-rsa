export class JwksRateLimitError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'JwksRateLimitError';
  }
}
