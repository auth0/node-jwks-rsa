/** @typedef {import('../types.js').DecodedToken} DecodedToken */
/** @typedef {import('../types.js').HapiCallback} HapiCallback */
/** @typedef {import('../types.js').HapiJwtOptions} HapiJwtOptions */

import { ArgumentError } from '../errors/ArgumentError.js';
import { JwksClient } from '../JwksClient.js';
import { allowedSignatureAlg } from './config.js';

/** @type {HapiJwtOptions['handleSigningKeyError']} */
const handleSigningKeyError = (err, cb) => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    // @ts-ignore
    return cb(err, null, null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    // @ts-ignore
    return cb(err, null, null);
  }
};

/**
 * Call hapiJwt2Key as a Promise
 *
 * @param {HapiJwtOptions} options
 * @returns {(decodedToken: DecodedToken) => Promise<{ key: string }>}
 */
export function hapiJwt2KeyAsync(options) {
  const secretProvider = hapiJwt2Key(options);
  return function (decoded) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const cb = (err, key) => {
        !key || err ? reject(err) : resolve({ key });
      };
      secretProvider(decoded, cb);
    });
  };
}

/**
 * @param {HapiJwtOptions} options
 * @returns {(decodedToken: DecodedToken, cb: HapiCallback) => void}
 */
export function hapiJwt2Key(options) {
  if (options === null || options === undefined) {
    throw new ArgumentError('An options object must be provided when initializing hapiJwt2Key');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;

  return function secretProvider(decoded, cb) {
    // We cannot find a signing certificate if there is no header (no kid).
    if (!decoded || !decoded.header) {
      // @ts-ignore
      return cb(new Error('Cannot find a signing certificate if there is no header'), null, null);
    }

    if (!allowedSignatureAlg.includes(decoded.header.alg)) {
      // @ts-ignore
      return cb(new Error('Unsupported algorithm ' + decoded.header.alg + ' supplied.'), null, null);
    }

    client
      .getSigningKey(decoded.header.kid)
      .then((key) => {
        // @ts-ignore
        return cb(null, key.publicKey || key.rsaPublicKey, key);
      })
      .catch((err) => {
        // @ts-ignore
        return onError(err, (newError) => cb(newError, null, null));
      });
  };
}
