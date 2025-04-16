/*
Copyright (c) 2022 Huawei Device Co., Ltd.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import cryptoFramework from '@ohos.security.cryptoFramework';

declare namespace Jwks {

  class JwksClient {
    constructor(options: Options);

    /**
     * get all keys data.
     *
     * @return all keys data from http.
     * @since 9
     */
    getKeys(): Promise<unknown>;

    /**
     * get all SigningKeys. Convert keys data into SigningKey
     *
     * @return all SigningKeys.
     * @since 9
     */
    getSigningKeys(): Promise<SigningKey[]>;

    /**
     * Obtain the SigningKey based on the id.
     *
     * @param The unique id of jwk.
     * @return SigningKey.
     * @since 9
     */
    getSigningKey(kid: string | null | undefined): Promise<SigningKey>;
  }

  /**
   * HTTP request header.
   */
  interface Headers {
    [key: string]: string;
  }

  /**
   * options to create JwksClient.
   */
  interface Options {
    /**
     * URL for initiating an HTTP request.
     */
    jwksUri: string;
    /**
     * whether to use rateLimit.
     */
    rateLimit?: boolean;
    /**
     * whether to use cache.
     */
    cache?: boolean;
    /**
     * Cache size.
     */
    cacheMaxEntries?: number;
    /**
     * Cache time.
     */
    cacheMaxAge?: number;
    /**
     * Number of requests per minute.
     */
    jwksRequestsPerMinute?: number;
    /**
     * HTTP request header.
     */
    requestHeaders?: Headers;
    /**
     * timeout period. The default value is 30,000, in ms.
     */
    timeout?: number;
  }

  interface SigningKey {
    /**
     * The unique id of jwk.
     */
    kid: string;
    /**
     * The algorithm id of jwk.
     */
    algorithm: string;
    /**
     * The type id of jwk.
     */
    type: string;
    /**
     * The usage id of jwk.
     */
    usage: string;
    /**
     * Obtain the PublicKey.
     *
     * @return PublicKey {@link cryptoFramework.PubKey}.
     * @since 9
     */
    getPublicKey(): cryptoFramework.PubKey;
  }

  /**
   * class to handle ArgumentError.
   */
  class ArgumentError extends Error {
    name: 'ArgumentError';
    constructor(message: string);
  }

  /**
   * class to handle JwksError.
   */
  class JwksError extends Error {
    name: 'JwksError';
    constructor(message: string);
  }

  /**
   * class to handle JwksRateLimitError.
   */
  class JwksRateLimitError extends Error {
    name: 'JwksRateLimitError';
    constructor(message: string);
  }

  /**
   * class to handle SigningKeyNotFoundError.
   */
  class SigningKeyNotFoundError extends Error {
    name: 'SigningKeyNotFoundError';
    constructor(message: string);
  }
}

export default Jwks;