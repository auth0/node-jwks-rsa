class JwksError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JwksError';
  }
}
export default JwksError;
