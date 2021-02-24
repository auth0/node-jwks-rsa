import debug from 'debug';
import memoizer from 'lru-memoizer';

export default function(client, { cacheMaxEntries = 5, cacheMaxAge = 600000 } = options) {
  const logger = debug('jwks');
  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`);
  return memoizer.sync({
    hash: (kid) => kid,
    load: client.getSigningKey.bind(client),
    maxAge: cacheMaxAge,
    max: cacheMaxEntries
  });
}
