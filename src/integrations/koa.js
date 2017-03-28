import { ArgumentError } from '../errors';
import { JwksClient } from '../JwksClient';

module.exports.koaJwtSecret = (options = {}) => {

  if (!options.jwksUri) {
    throw new ArgumentError('No JWKS URI provided');
  }

  const client = new JwksClient(options);

  return function secretProvider({ alg, kid } = {}) {

    return new Promise((resolve, reject) => {

      // Only RS256 is supported.
      if (alg !== 'RS256') {
        return reject(new Error('Missing / invalid token algorithm'));
      }

      client.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(err);
        }

        // Provide the key.
        resolve(key.publicKey || key.rsaPublicKey);
      });
    });
  };
};
