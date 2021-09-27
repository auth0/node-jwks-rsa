const logger = require('debug')('jwks');
const memoizer = require('lru-memoizer');

function cacheWrapper(client, { cacheMaxEntries = 5, cacheMaxAge = 600000 }) {
  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`);
  return memoizer.sync({
    hash: (kid) => kid,
    load: client.getSigningKey.bind(client),
    maxAge: cacheMaxAge,
    max: cacheMaxEntries
  });
}

module.exports.default = cacheWrapper;
