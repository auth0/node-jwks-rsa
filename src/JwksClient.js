import debug from 'debug';
import request from 'request';
import map from 'async/map';

import ArgumentError from './errors/ArgumentError';
import JwksError from './errors/JwksError';
import SigningKeyNotFoundError from './errors/SigningKeyNotFoundError';

import { certToPEM, rsaPublicKeyToPEM } from './utils';
import { cacheSigningKey, rateLimitSigningKey } from './wrappers';

export class JwksClient {
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

    var jwksUri = Array.isArray(this.options.jwksUri) ? this.options.jwksUri : [this.options.jwksUri];
    var self = this;

    map(jwksUri, (jwkUri, callback) => {
      request({ json: true, uri: jwkUri, strictSSL: self.options.strictSsl }, (err, res) => {
        if (err || res.statusCode < 200 || res.statusCode >= 300) {
          self.logger('Failure:', res && res.body || err, 'Uri:', jwkUri);

          return callback(null, []);
        }

        self.logger('Keys:', res.body.keys);
        return callback(null, res.body.keys);
      });
    }, (err, results) => {
      if (err) {
        return cb(err);
      }

      var keys = results.reduce((a, b) => {
        return a.concat(b);
      });

      return cb(null, keys);
    });
  }

  getSigningKeys(cb) {
    this.getKeys((err, keys) => {
      if (err) {
        return cb(err);
      }

      if (!keys || !keys.length) {
        return cb(new JwksError('The JWKS endpoint did not contain any keys'));
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
        return cb(new JwksError('The JWKS endpoint did not contain any signing keys'));
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
        return cb(new SigningKeyNotFoundError(`Unable to find a signing key that matches '${kid}'`));
      }
    });
  }
}
