import JwksClient from './JwksClient';
import JwksError from './errors/JwksError';
import JwksRateLimitError from './errors/JwksRateLimitError';
import SigningKeyNotFoundError from './errors/SigningKeyNotFoundError';

module.exports = (options) => {
  return new JwksClient(options);
};

module.exports.JwksError = JwksError;
module.exports.JwksRateLimitError = JwksRateLimitError;
module.exports.SigningKeyNotFoundError = SigningKeyNotFoundError;

module.exports.expressJwtSecret = (options) => {
  const client = new JwksClient(options);

  return function secretProvider(req, header, payload, cb) {
    // Only RS256 is supported.
    if (header.alg !== 'RS256') {
      return cb(null, null);
    }

    client.getSigningKey(header.kid, (err, key) => {
      // If we didn't find a match, can't provide a key.
      if (err && err.name === 'SigningKeyNotFoundError') {
        return cb(null, null);
      }

      // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
      if (err) {
        return cb(err, null);
      }

      // Provide the key.
      return cb(null, key.publicKey || key.rsaPublicKey);
    });
  };
};

module.exports.hapiJwt2Key = (options) => {
  const client = new JwksClient(options);
  return function keyProvider(decoded, cb) {
    // We cannot find a signing certificate if there is no header (no kid).
    if (!decoded.header) {
      return cb(null, null);
    }

    // Only RS256 is supported.
    if (decoded.header.alg !== 'RS256') {
      return cb(null, null);
    }

    client.getSigningKey(decoded.header.kid, (err, key) => {
      // If we didn't find a match, can't provide a key.
      if (err && err.name === 'SigningKeyNotFoundError') {
        return cb(null, null);
      }

      // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
      if (err) {
        return cb(err, null);
      }

      // Provide the key.
      return cb(null, key.publicKey || key.rsaPublicKey, key);
    });
  };
};
