import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import type {Jwt, Secret} from 'jsonwebtoken'
import Express = require('express')

declare function JwksRsa(options: JwksRsa.Options): JwksRsa.JwksClient;

declare namespace JwksRsa {
  class JwksClient {
    constructor(options: Options);

    getKeys(): Promise<unknown>;
    getSigningKeys(): Promise<SigningKey[]>;
    getSigningKey(kid?: string | null | undefined): Promise<SigningKey>;
    getSigningKey(kid: string | null | undefined, cb: (err: Error | null, key?: SigningKey) => void): void;
  }

  interface Headers {
    [key: string]: string;
  }

  interface Options {
    jwksUri: string;
    rateLimit?: boolean;
    cache?: boolean;
    cacheMaxEntries?: number;
    // The max age of the JWKS cache (in ms)
    cacheMaxAge?: number;
    // The max number of requests permitted to the JWKS endpoint per minute
    jwksRequestsPerMinute?: number;
    proxy?: string;
    requestHeaders?: Headers;
    timeout?: number;
    requestAgent?: HttpAgent | HttpsAgent;
    fetcher?(jwksUri: string): Promise<{ keys: any }>;
    getKeysInterceptor?(): Promise<JSONWebKey[]>;
  }

  interface JSONWebKey {
    kid: string,
    alg: string,
    [key: string]: any
  }

  interface CertSigningKey {
    kid: string;
    alg: string;
    getPublicKey(): string;
    publicKey: string;
  }

  interface RsaSigningKey {
    kid: string;
    alg: string;
    getPublicKey(): string;
    rsaPublicKey: string;
  }

  type SigningKey = CertSigningKey | RsaSigningKey;

  /**
   * Types are duplicated from express-jwt@6/7
   * due to numerous breaking changes in the lib's types
   * whilst this lib supportd both <=6 & >=7  implementations
   *
   * express-jwt's installed version (or its @types)
   * will be the types used at transpilation time
   */

  /** Types from express-jwt@<=6 */
  type secretType = string|Buffer;
  type SecretCallbackLong = (req: Express.Request, header: any, payload: any, done: (err: any, secret?: secretType) => void) => void;
  type SecretCallback = (req: Express.Request, payload: any, done: (err: any, secret?: secretType) => void) => void;

  /** Types from express-jwt@>=7 */
  type GetVerificationKey = (req: Express.Request, token: Jwt | undefined) => Secret | Promise<Secret>;

  function expressJwtSecret(options: ExpressJwtOptions): SecretCallbackLong|GetVerificationKey;

  function passportJwtSecret(options: ExpressJwtOptions): SecretCallback;

  interface ExpressJwtOptions extends Options {
    handleSigningKeyError?: (err: Error | null, cb: (err: Error | null) => void) => void;
  }

  function hapiJwt2Key(options: HapiJwtOptions): (decodedToken: DecodedToken, cb: HapiCallback) => void;

  interface HapiJwtOptions extends Options {
    handleSigningKeyError?: (err: Error | null, cb: HapiCallback) => void;
  }

  type HapiCallback = (err: Error | null, publicKey: string, signingKey: SigningKey) => void;

  interface DecodedToken {
    header: TokenHeader;
  }

  interface TokenHeader {
    alg: string;
    kid: string;
  }

  function hapiJwt2KeyAsync(options: HapiJwtOptions): (decodedToken: DecodedToken) => Promise<{ key: string }>;

  function koaJwtSecret(options: KoaJwtOptions): (header: TokenHeader) => Promise<string>;

  interface KoaJwtOptions extends Options {
    handleSigningKeyError?(err: Error | null): Promise<void>;
  }

  class ArgumentError extends Error {
    name: 'ArgumentError';
    constructor(message: string);
  }

  class JwksError extends Error {
    name: 'JwksError';
    constructor(message: string);
  }

  class JwksRateLimitError extends Error {
    name: 'JwksRateLimitError';
    constructor(message: string);
  }

  class SigningKeyNotFoundError extends Error {
    name: 'SigningKeyNotFoundError';
    constructor(message: string);
  }
}

export = JwksRsa;
