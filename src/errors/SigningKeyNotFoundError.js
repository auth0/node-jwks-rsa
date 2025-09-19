class SigningKeyNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SigningKeyNotFoundError';
  }
}
export default SigningKeyNotFoundError;
