import ms from 'ms';
import debug from 'debug';
import memoizer from 'lru-memoizer';

export default function(client, { customCache, cacheMaxEntries = 5, cacheMaxAge = ms('10m') } = options) {
  const logger = debug('jwks');
  const getSigningKey = client.getSigningKey;

  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`);

  if (customCache) {
    return (kid, callback) => 
      customCache.get(kid, getSigningKey)
        .then(key => callback(null, key))
        .catch(err => callback(err));
  }

  return memoizer({
    load: (kid, callback) => {
      getSigningKey(kid, (err, key) => {
        if (err) {
          return callback(err);
        }

        logger(`Caching signing key for '${kid}':`, key);
        return callback(null, key);
      });
    },
    hash: (kid) => kid,
    maxAge: cacheMaxAge,
    max: cacheMaxEntries
  });
}
