import { ArgumentError } from '../errors';
import { JwksClient } from '../JwksClient';

const handleSigningKeyError = (err, cb) => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return cb(null, null, null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    return cb(err, null, null);
  }
};

module.exports.hapiJwt2Key = (options) => {
  if (options === null || options === undefined) {
    throw new ArgumentError('An options object must be provided when initializing expressJwtSecret');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;

  return function secretProvider(decoded, cb) {
    // We cannot find a signing certificate if there is no header (no kid).
    if (!decoded || !decoded.header) {
      if (cb) {
        return cb(null, null, null);
      }
      return Promise.resolve();
    }

    // Only RS256 is supported.
    if (decoded.header.alg !== 'RS256') {
      if (cb) {
        return cb(null, null, null);
      }
      return Promise.resolve();
    }

    if (cb) {
      return client.getSigningKey(decoded.header.kid, (err, key) => {
        if (err) {
          return onError(err, (newError) => cb(newError, null, null));
        }

        // Provide the key.
        return cb(null, key.publicKey || key.rsaPublicKey, key);
      });
    }

    return new Promise((resolve, reject) => {
      client.getSigningKey(decoded.header.kid, (err, key) => {
        if (err) {
          return onError(err, reject);
        }

        // Provide the key.
        return resolve({ key: key.publicKey || key.rsaPublicKey });
      });
    });
  };
};
