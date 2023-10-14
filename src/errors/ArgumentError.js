export class ArgumentError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'ArgumentError';
  }
}
