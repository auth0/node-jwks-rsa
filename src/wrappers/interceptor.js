import { retieveSigningKeys } from '../utils';

/**
 * Uses getKeysInterceptor to allow users to retrieve keys from a file,
 * external cache, or provided object before falling back to the jwksUri endpoint
 */
export default function(client, { getKeysInterceptor } = options) {
  const getSigningKey = client.getSigningKey;

  return (kid, cb) => {
    getKeysInterceptor((err, keys) => {
      if (err) {
        return cb(err);
      }

      let signingKeys;
      if (keys && keys.length) {
        signingKeys = retieveSigningKeys(keys);
      }

      if (signingKeys && signingKeys.length) {
        const key = signingKeys.find(k => !kid || k.kid === kid);

        if (key) {
          return cb(null, key);
        }
      }

      return getSigningKey(kid, cb);
    });
  };
}
