import { ArgumentError } from '../errors';
import { JwksClient } from '../JwksClient';

const handleSigningKeyError = (err, cb) => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return cb(null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    return cb(err);
  }
};

module.exports.fastifyJwtSecret = options => {
  if (options === null || options === undefined) {
    throw new ArgumentError(
      'An options object must be provided when initializing fastifyJwtSecret',
    );
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;
  return function secretProvider(request, decoded, cb) {
    // if decoded is null, token is not present or is invalid
    if (!decoded|| !decoded.header) {
      return cb(new Error('Invalid token'), null);
    }
    // Only RS256 is supported.
    if (decoded.header.alg !== 'RS256') {
      return cb(new Error('Only RS256 is supported'), null);
    }

    client.getSigningKey(decoded.header.kid, (err, key) => {
      if (err) {
        return onError(err, newError => cb(newError, null));
      }
      // Provide the key.
      return cb(null, key.publicKey || key.rsaPublicKey);
    });
  };
};
