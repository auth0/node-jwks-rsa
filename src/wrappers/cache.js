import createDebug from 'debug';
import { promisify, callbackify } from 'util';

// CJS import workaround for lru-memoizer
import { createRequire } from 'module';
const cjsRequire = createRequire(import.meta.url);
const memoizer = cjsRequire('lru-memoizer');

const logger = createDebug('jwks');

function cacheWrapper(client, { cacheMaxEntries = 5, cacheMaxAge = 600000 }) {
  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`);
  return promisify(memoizer({
    hash: (kid) => kid,
    load: callbackify(client.getSigningKey.bind(client)),
    maxAge: cacheMaxAge,
    max: cacheMaxEntries
  }));
}
export default cacheWrapper;
