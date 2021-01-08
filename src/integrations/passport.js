import { JWT } from 'jose';
import { ArgumentError } from '../errors';
import { JwksClient } from '../JwksClient';
import supportedAlg from './config';

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

module.exports.passportJwtSecret = (options) => {
  if (options === null || options === undefined) {
    throw new ArgumentError('An options object must be provided when initializing passportJwtSecret');
  }

  if (!options.jwksUri && !options.jwksObject) {
    throw new ArgumentError('No JWKS provided. Please provide a jwksUri or jwksObject');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;

  return function secretProvider(req, rawJwtToken, cb) {
    let decoded;
    try {
      decoded = JWT.decode(rawJwtToken, { complete: true });
    } catch (err) {}

    if (!decoded || !supportedAlg.includes(decoded.header.alg)) {
      return cb(null, null);
    }

    client.getSigningKey(decoded.header.kid, (err, key) => {
      if (err) {
        return onError(err, (newError) => cb(newError, null));
      }

      // Provide the key.
      return cb(null, key.publicKey || key.rsaPublicKey);
    });
  };
};
