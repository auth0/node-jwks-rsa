import ms from 'ms';
import debug from 'debug';
import memoizer from 'lru-memoizer';
import { existsSync, readFile, writeFileSync } from 'fs';

export default function (client, { cacheMaxEntries = 5, cacheMaxAge = ms('10m'), useTmpFileCache = false } = options) {
  const logger = debug('jwks');
  const getSigningKey = client.getSigningKey;

  logger(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`);

  const fileCacheGet = (kid, callback) => {
    const filePath = '/tmp/jwks-cache';
    if (!existsSync(filePath)) {
      writeFileSync(filePath, JSON.stringify({}));
    }
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return callback(err);
      }
      const jsonData = JSON.parse(data);
      if (jsonData[kid]) {
        return callback(null, jsonData[kid]);
      }

      getSigningKey(kid, (err, key) => {
        if (err) {
          return callback(err);
        }
        logger(`Caching signing key in filesystem for '${kid}':`, key);
        const content = { ...jsonData, [kid]: key };
        writeFileSync(filePath, JSON.stringify(content), (err) => {
          if (err) {
            return callback(err);
          }
          return callback(null, key);
        });
      });
    });
  };

  return memoizer({
    load: (kid, callback) => {
      if (useTmpFileCache) {
        return fileCacheGet(kid, callback);
      }

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
