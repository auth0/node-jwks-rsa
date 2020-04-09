import debug from 'debug';
import request from './wrappers/request';
import JwksError from './errors/JwksError';
import SigningKeyNotFoundError from './errors/SigningKeyNotFoundError';

import {
  certToPEM,
  rsaPublicKeyToPEM
} from './utils';
import {
  cacheSigningKey,
  rateLimitSigningKey
} from './wrappers';

export class JwksClient {
  constructor(options) {
    this.options = {
      rateLimit: false,
      cache: true,
      timeout: 30000,
      ...options
    };
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
    request({
      uri: this.options.jwksUri,
      strictSSL: this.options.strictSsl,
      headers: this.options.requestHeaders,
      agentOptions: this.options.requestAgentOptions,
      proxy: this.options.proxy,
      timeout: this.options.timeout
    }, (err, res) => {
      if (err) {
        const errorResponse = err.response;
        this.logger('Failure:', errorResponse && errorResponse.data || err);
        if (errorResponse) {
          return cb(new JwksError(errorResponse.data || errorResponse.statusText || `Http Error ${errorResponse.status}`));
        }
        return cb(err);
      }

      this.logger('Keys:', res.data.keys);
      return cb(null, res.data.keys);
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
        .filter((key) => {
          if(key.kty !== 'RSA') {
            return false;
          }
          if(key.hasOwnProperty('use') && key.use !== 'sig') {
            return false;
          }
          return ((key.x5c && key.x5c.length) || (key.n && key.e));
        })
        .map(key => {
          const jwk = {
            kid: key.kid,
            nbf: key.nbf
          };
          const hasCertificateChain = key.x5c && key.x5c.length;
          if (hasCertificateChain) {
            jwk.publicKey = certToPEM(key.x5c[0]);
            jwk.getPublicKey = () => jwk.publicKey;
          } else {
            jwk.rsaPublicKey = rsaPublicKeyToPEM(key.n, key.e);
            jwk.getPublicKey = () => jwk.rsaPublicKey;
          }
          return jwk;
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

      const kidDefined = kid !== undefined && kid !== null;
      if (!kidDefined && keys.length > 1) {
        this.logger('No KID specified and JWKS endpoint returned more than 1 key');
        return cb(new SigningKeyNotFoundError('No KID specified and JWKS endpoint returned more than 1 key'));
      }

      const key = keys.find(k => !kidDefined || k.kid === kid);
      if (key) {
        return cb(null, key);
      } else {
        this.logger(`Unable to find a signing key that matches '${kid}'`);
        return cb(new SigningKeyNotFoundError(`Unable to find a signing key that matches '${kid}'`));
      }
    });
  }
}
