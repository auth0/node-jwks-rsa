import ms from 'ms';
import debug from 'debug';
import request from 'request';
import memoizer from 'lru-memoizer';

import { certToPEM, rsaPublicKeyToPEM } from './lib/utils';

export default class JwksClient {
  constructor({ cache = true, cacheMaxEntries = 5, cacheMaxAge = ms('10h'), jwksUri, strictSsl = true } = options) {
    this.logger = debug('jwks');
    this.jwksUri = jwksUri;
    this.strictSsl = strictSsl;
    this.cacheMaxEntries = cacheMaxEntries;
    this.cacheMaxAge = cacheMaxAge;

    // Cached version to avoid too many roundtrips to the JWKS endpoint.
    if (cache) {
      this.getSigningKey = memoizer({
        load: (kid, callback) => {
          this._getSigningKeyInternal(kid, (err, key) => {
            if (err) {
              return callback(err);
            }

            this.logger(`Caching signing key for '${kid}':`, key);
            return callback(null, key);
          });
        },
        hash: (kid) => kid,
        maxAge: this.cacheMaxAge,
        max: this.cacheMaxEntries
      });
    } else {
      this.getSigningKey = this._getSigningKeyInternal;
    }
  }

  getKeys(cb) {
    this.logger(`Retrieving keys from ${this.jwksUri}`);

    request({ json: true, uri: this.jwksUri, strictSSL: this.strictSsl }, (err, res) => {
      if (err || res.statusCode < 200 || res.statusCode >= 300) {
        this.logger('Failure:', res && res.body || err);
        if (res) {
          return cb(new Error(res.body && (res.body.message || res.body) || res.statusMessage || `Http Error ${res.statusCode}`));
        }
        return cb(err);
      }

      this.logger('Keys:', res.body.keys);
      return cb(null, res.body.keys);
    });
  }

  getSigningKeys(cb) {
    this.getKeys((err, keys) => {
      if (err) {
        return cb(err);
      }

      if (!keys || !keys.length) {
        return cb(new Error('The JSON Web Key Set endpoint did not contain any keys'));
      }

      const signingKeys = keys
        .filter(key => key.use === 'sig' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e)))
        .map(key => {
          if (key.x5c && key.x5c.length) {
            return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
          } else {
            return { kid: key.kid, nbf: key.nbf, rsaPublicKey: rsaPublicKeyToPEM(key.n, key.e) };
          }
        });

      if (!signingKeys.length) {
        return cb(new Error('The JSON Web Key Set endpoint did not contain any signing keys'));
      }

      this.logger('Signing Keys:', signingKeys);
      return cb(null, signingKeys);
    });
  }

  _getSigningKeyInternal(kid, cb) {
    this.getSigningKeys((err, keys) => {
      if (err) {
        return cb(err);
      }

      const key = keys.find(k => k.kid === kid);
      if (key && key.length) {
        cb(null, key[0]);
      } else {
        cb(null, null);
      }
    });
  }
}
