const logger = require('debug')('jwks');
const memoizer = require('lru-memoizer');
const { LRUCache } = require('lru-cache');
const { promisify, callbackify } = require('util');

function cacheWrapper(client, { cacheMaxEntries = 5, cacheMaxAge = 600000, cacheMaxAgeFallback }) {
  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}${cacheMaxAgeFallback ? ` / Fallback: ${cacheMaxAgeFallback}` : ''}`);

  /**
   * cacheMaxAgeFallback: when the JWKS endpoint is unreachable and cacheMaxAge has expired,
   * rather than immediately failing to return a signing key, the lib can continue serving
   * the last known good key for an additional window (cacheMaxAgeFallback ms). This prevents
   * callers from failing on every getSigningKey call during a transient JWKS endpoint downtime.
   *
   * Two load variants: with cacheMaxAgeFallback, we maintain a stale-key store so a failed
   * refresh can fall back to the last known good key within the window. Without it, we skip
   * the extra cache entirely to avoid any overhead.
   */
  let load;
  if (cacheMaxAgeFallback) {
    const staleCache = new LRUCache({ max: cacheMaxEntries });
    const getSigningKey = client.getSigningKey.bind(client);

    load = callbackify(async (kid) => {
      try {
        const key = await getSigningKey(kid);
        staleCache.set(kid, { key, fetchedAt: Date.now() });
        return key;
      } catch (err) {
        const stale = staleCache.get(kid);
        if (stale && (Date.now() - stale.fetchedAt) < (cacheMaxAge + cacheMaxAgeFallback)) {
          logger(`Signing key for '${kid}' is stale but within fallback window, serving stale key`);
          return stale.key;
        }
        logger(`Signing key for '${kid}' has no valid stale entry, fallback window expired or key never fetched`);
        throw err;
      }
    });
  } else {
    load = callbackify(client.getSigningKey.bind(client));
  }

  return promisify(memoizer({
    hash: (kid) => kid,
    load,
    ttl: cacheMaxAge,
    max: cacheMaxEntries
  }));
}

module.exports.default = cacheWrapper;
