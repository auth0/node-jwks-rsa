/** @typedef {import('./types.js').Options} Options */

import debug from 'debug';

import { cacheWrapper as cacheSigningKey } from './wrappers/cache.js';
import { callbackSupport } from './wrappers/callbackSupport.js';
import { getKeysInterceptor } from './wrappers/interceptor.js';
import { JwksError } from './errors/JwksError.js';
import { rateLimitWrapper as rateLimitSigningKey } from './wrappers/rateLimit.js';
import { retrieveSigningKeys } from './utils.js';
import { SigningKeyNotFoundError } from './errors/SigningKeyNotFoundError.js';
import { request } from './wrappers/request.js';

const logger = debug('jwks');

export class JwksClient {
  /** @param {Options} options */
  constructor(options) {
    this.options = {
      rateLimit: false,
      cache: true,
      timeout: 30000,
      ...options
    };

    // Initialize wrappers.
    if (this.options.getKeysInterceptor) {
      this.getSigningKey = getKeysInterceptor(this, options);
    }

    if (this.options.rateLimit) {
      this.getSigningKey = rateLimitSigningKey(this, options);
    }
    if (this.options.cache) {
      this.getSigningKey = cacheSigningKey(this, options);
    }

    this.getSigningKey = callbackSupport(this);
  }

  async getKeys() {
    logger(`Fetching keys from '${this.options.jwksUri}'`);

    try {
      const res = await request({
        uri: this.options.jwksUri,
        headers: this.options.requestHeaders,
        agent: this.options.requestAgent,
        timeout: this.options.timeout,
        fetcher: this.options.fetcher
      });

      logger('Keys:', res.keys);
      return res.keys;
    } catch (err) {
      const { errorMsg } = err;
      logger('Failure:', errorMsg || err);
      throw errorMsg ? new JwksError(errorMsg) : err;
    }
  }

  async getSigningKeys() {
    const keys = await this.getKeys();

    if (!keys || !keys.length) {
      throw new JwksError('The JWKS endpoint did not contain any keys');
    }

    const signingKeys = await retrieveSigningKeys(keys);

    if (!signingKeys.length) {
      throw new JwksError('The JWKS endpoint did not contain any signing keys');
    }

    logger('Signing Keys:', signingKeys);
    return signingKeys;
  }

  async getSigningKey(kid) {
    logger(`Fetching signing key for '${kid}'`);
    const keys = await this.getSigningKeys();

    const kidDefined = kid !== undefined && kid !== null;
    if (!kidDefined && keys.length > 1) {
      logger('No KID specified and JWKS endpoint returned more than 1 key');
      throw new SigningKeyNotFoundError('No KID specified and JWKS endpoint returned more than 1 key');
    }

    const key = keys.find((k) => !kidDefined || k.kid === kid);
    if (key) {
      return key;
    } else {
      logger(`Unable to find a signing key that matches '${kid}'`);
      throw new SigningKeyNotFoundError(`Unable to find a signing key that matches '${kid}'`);
    }
  }
}
