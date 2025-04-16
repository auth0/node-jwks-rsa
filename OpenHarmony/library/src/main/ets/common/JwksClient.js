/**
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2021 Huawei Device Co., Ltd.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */
import {retrieveSigningKeys } from './utils';
import {rateLimitWrapper} from "./wrappers/rateLimit"
import {getKeysInterceptor} from "./wrappers/interceptor"
import {cacheWrapper} from "./wrappers/cache"
import {callbackSupport} from "./wrappers/callbackSupport"
import {Request} from "./wrappers/request"

import JwksError from './errors/JwksError'
import SigningKeyNotFoundError from './errors/SigningKeyNotFoundError'

let requestInstance = new Request()
//Provide external interfaces
export class JwksClient {
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
      this.getSigningKey = rateLimitWrapper(this, options);
    }
    if (this.options.cache) {
      this.getSigningKey = cacheWrapper(this, options);
    }

    this.getSigningKey = callbackSupport(this);
  }

  async getKeys() {
    console.info(`Fetching keys from '${this.options.jwksUri}'`);
    try {
      const res = await requestInstance.request({
        uri: this.options.jwksUri,
        headers: this.options.requestHeaders,
        agent: this.options.requestAgent,
        timeout: this.options.timeout,
        fetcher: this.options.fetcher
      });
      console.info("http data = " + JSON.stringify(res.keys))
      return res.keys;
    } catch (err) {
      const { errorMsg } = err;
      console.info('Failure:', errorMsg || err);
      throw (errorMsg ? new JwksError(errorMsg) : err);
    }
  }

  async getSigningKeys() {
    const keys = await this.getKeys();

    if (!keys || !keys.length) {
      throw new JwksError('The JWKS endpoint did not contain any keys');
    }

    const signingKeys = retrieveSigningKeys(keys);
    if (!signingKeys.length) {
      throw new JwksError('The JWKS endpoint did not contain any signing keys');
    }
    return signingKeys;
  }

  async getSigningKey (kid) {
    console.info(`Fetching signing key for '${kid}'`);
    const keys = await this.getSigningKeys();
    const kidDefined = kid !== undefined && kid !== null;
    if (!kidDefined && keys.length > 1) {
      throw new SigningKeyNotFoundError('No KID specified and JWKS endpoint returned more than 1 key');
    }

    const key = keys.find(k => !kidDefined || k.kid === kid);
    if (key) {
      return key;
    } else {
      throw new SigningKeyNotFoundError('Unable to find a signing key that matches');
    }
  }
}
