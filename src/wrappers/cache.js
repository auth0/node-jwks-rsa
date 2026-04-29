const logger = require('debug')('jwks');
const memoizer = require('lru-memoizer');
const { LRUCache } = require('lru-cache');
const { promisify, callbackify } = require('util');

function cacheWrapper(client, { cacheMaxEntries = 5, cacheMaxAge = 600000, cacheMaxAgeFallback }) {
  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}${cacheMaxAgeFallback ? ` / Fallback: ${cacheMaxAgeFallback}` : ''}`);

  const staleCache = new LRUCache({ max: cacheMaxEntries });
  const getSigningKey = client.getSigningKey.bind(client);

  const load = callbackify(async (kid) => {
    try {
      const key = await getSigningKey(kid);
      staleCache.set(kid, { key, fetchedAt: Date.now() });
      return key;
    } catch (err) {
      if (cacheMaxAgeFallback) {
        const stale = staleCache.get(kid);
        if (stale && (Date.now() - stale.fetchedAt) < (cacheMaxAge + cacheMaxAgeFallback)) {
          logger(`Signing key for '${kid}' is stale but within fallback window, serving stale key`);
          return stale.key;
        }
      }
      throw err;
    }
  });

  return promisify(memoizer({
    hash: (kid) => kid,
    load,
    ttl: cacheMaxAge,
    max: cacheMaxEntries
  }));
}

module.exports.default = cacheWrapper;
