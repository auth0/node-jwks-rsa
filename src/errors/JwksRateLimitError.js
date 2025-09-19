class JwksRateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JwksRateLimitError';
  }
}
export default JwksRateLimitError;
