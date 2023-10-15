/** @typedef {import('../JwksClient.js').JwksClient} JwksClient */
/** @typedef {import('../types.js').Options} Options */

import debug from 'debug';
import memoizer from 'lru-memoizer';
import { promisify, callbackify } from 'node:util';

const logger = debug('jwks');

/**
 * @param {JwksClient} client
 * @param {Omit<Options, 'cache'> & Required<Pick<Options, 'cache'>>} options
 */
export function cacheWrapper(client, { cacheMaxEntries = 5, cacheMaxAge = 600000 }) {
  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`);
  return promisify(
    memoizer({
      // @ts-ignore
      hash: (kid) => kid,
      load: callbackify(client.getSigningKey.bind(client)),
      // @ts-ignore
      maxAge: cacheMaxAge,
      max: cacheMaxEntries
    })
  );
}
