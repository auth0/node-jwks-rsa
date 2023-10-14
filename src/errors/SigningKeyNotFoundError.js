export class SigningKeyNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SigningKeyNotFoundError';
  }
}
