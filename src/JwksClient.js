import debug from 'debug';
import request from 'request';

import { certToPEM, rsaPublicKeyToPEM } from './lib/utils';
import { cacheSigningKey, rateLimitSigningKey } from './lib/wrappers';

export default class JwksClient {
  constructor(options) {
    this.options = { rateLimit: false, cache: false, strictSsl: true, ...options };
    this.logger = debug('jwks');

    // Initialize wrappers.
    if (this.options.rateLimit) {
      this.getSigningKey = rateLimitSigningKey(this, options);
    }
    if (this.options.cache) {
      this.getSigningKey = cacheSigningKey(this, options);
    }
  }

  getKeys(cb) {
    this.logger(`Fetching keys from '${this.options.jwksUri}'`);
    request({ json: true, uri: this.options.jwksUri, strictSSL: this.options.strictSsl }, (err, res) => {
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
        return cb(new Error('The JWKS endpoint did not contain any keys'));
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
        return cb(new Error('The JWKS endpoint did not contain any signing keys'));
      }

      this.logger('Signing Keys:', signingKeys);
      return cb(null, signingKeys);
    });
  }

  getSigningKey = (kid, cb) => {
    this.logger(`Fetching signing key for '${kid}'`);

    this.getSigningKeys((err, keys) => {
      if (err) {
        return cb(err);
      }

      const key = keys.find(k => k.kid === kid);
      if (key) {
        return cb(null, key);
      } else {
        this.logger(`Unable to find a signing key that matches '${kid}'`);
        return cb(new Error(`Unable to find a signing key that matches '${kid}'`));
      }
    });
  }
}
