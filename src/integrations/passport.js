import * as jose from 'jose';
import { ArgumentError } from '../errors/index.js';
import { JwksClient } from '../JwksClient.js';
import supportedAlg from './config.js';

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

export function passportJwtSecret(options) {
  if (options === null || options === undefined) {
    throw new ArgumentError('An options object must be provided when initializing passportJwtSecret');
  }

  if (!options.jwksUri) {
    throw new ArgumentError('No JWKS provided. Please provide a jwksUri');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;

  return function secretProvider(req, rawJwtToken, cb) {
    let header;
    try {
      header = jose.decodeProtectedHeader(rawJwtToken);
    } catch (_) {
      return cb(new Error('jwt malformed'), null);
    }

    if (!header || !supportedAlg.includes(header.alg)) {
      return cb(null, null);
    }

    client.getSigningKey(header.kid)
      .then(async key => {
        const pem = key.publicKey || key.rsaPublicKey;
        const alg = header.alg;
        try {
          // Try to import and verify first (defense in depth). If import fails, fall back to returning PEM (legacy behavior).
          let verifyKey;
          try {
            verifyKey = await jose.importSPKI(pem, alg);
          } catch (_) {
            return cb(null, pem);
          }
          await jose.jwtVerify(rawJwtToken, verifyKey, { algorithms: [ alg ] });
          return cb(null, pem);
        } catch (_) {
          return cb(new Error('invalid signature'));
        }
      })
      .catch(err => {
        onError(err, (newError) => cb(newError, null));
      });
  };
}
