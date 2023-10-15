/** @typedef {import('../types.js').ExpressJwtOptions} ExpressJwtOptions */
/** @typedef {import('../types.js').GetVerificationKey} GetVerificationKey */
/** @typedef {import('../types.js').SecretCallbackLong} SecretCallbackLong */

import { ArgumentError } from '../errors/ArgumentError.js';
import { JwksClient } from '../JwksClient.js';
import { allowedSignatureAlg } from './config.js';

/** @type {ExpressJwtOptions['handleSigningKeyError']} */
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

/**
 * @param {ExpressJwtOptions} options
 * @returns {SecretCallbackLong | GetVerificationKey}
 */
export function expressJwtSecret(options) {
  if (options === null || options === undefined) {
    throw new ArgumentError('An options object must be provided when initializing expressJwtSecret');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;

  // @ts-ignore
  const expressJwt7Provider = async (req, token) => {
    if (!token) {
      return;
    }
    const header = token.header;
    if (!header || !allowedSignatureAlg.includes(header.alg)) {
      return;
    }
    try {
      const key = await client.getSigningKey(header.kid);
      return key.publicKey || key.rsaPublicKey;
    } catch (err) {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        onError(err, (newError) => {
          if (!newError) {
            // @ts-ignore
            return resolve();
          }
          reject(newError);
        });
      });
    }
  };

  return function secretProvider(req, header, _payload, cb) {
    //This function has 4 parameters to make it work with express-jwt@6
    //but it also supports express-jwt@7 which only has 2.
    if (arguments.length === 4) {
      expressJwt7Provider(req, { header })
        .then((key) => {
          setImmediate(cb, null, key);
        })
        .catch((err) => {
          setImmediate(cb, err);
        });

      return;
    }

    return expressJwt7Provider(req, arguments[1]);
  };
}
