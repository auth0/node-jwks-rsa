import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import type {Jwt, Secret} from 'jsonwebtoken';

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

  interface OptionsBase {
    rateLimit?: boolean;
    cache?: boolean;
    cacheMaxEntries?: number;
    cacheMaxAge?: number;
    /**
     * Additional duration in milliseconds to continue serving a stale signing key when
     * the JWKS endpoint is unreachable and `cacheMaxAge` has expired.
     *
     * The fallback window is measured from the last successful fetch:
     * stale key is served while `Date.now() - lastFetchedAt < cacheMaxAge + cacheMaxAgeFallback`.
     *
     * Not set by default — must be opted into explicitly. This is an availability vs. security
     * tradeoff: a compromised key will continue to be trusted for this window if the endpoint
     * goes down simultaneously with a key rotation. Set this to your expected endpoint recovery time.
     *
     * Has no effect unless `cache` is enabled.
     */
    cacheMaxAgeFallback?: number;
    /**
     * Callback invoked when a stale signing key is successfully served because the JWKS
     * endpoint was unreachable and the entry was still within the `cacheMaxAgeFallback` window.
     *
     * Use this to emit metrics, trigger alerts, or log warnings so your observability tooling
     * can detect JWKS endpoint outages even when requests are succeeding via the stale cache.
     *
     * @param err   - The endpoint error that caused the fallback (network failure or HTTP error)
     * @param kid   - The key ID that was requested
     * @param staleKey - The stale signing key being served
     *
     * Only called on successful stale fallback. Not called when the fallback window has expired
     * or when the kid was never fetched before.
     */
    onStaleCacheFallback?(err: Error, kid: string | null | undefined, staleKey: SigningKey): void;
    jwksRequestsPerMinute?: number;
    proxy?: string;
    requestHeaders?: Headers;
    timeout?: number;
    requestAgent?: HttpAgent | HttpsAgent;
    followRedirects?: boolean;
    getKeysInterceptor?(): Promise<JSONWebKey[]>;
  }

  interface OptionsWithFetcher extends OptionsBase {
    fetcher(jwksUri: string): Promise<{ keys: any }>;
    jwksUri?: string;
  }

  interface OptionsWithUri extends OptionsBase {
    jwksUri: string;
    fetcher?(jwksUri: string): Promise<{ keys: any }>;
  }

  type Options = OptionsWithFetcher | OptionsWithUri;

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
  type SecretCallbackLong = (req: unknown, header: any, payload: any, done: (err: any, secret?: secretType) => void) => void;
  type SecretCallback = (req: unknown, payload: any, done: (err: any, secret?: secretType) => void) => void;

  /** Types from express-jwt@>=7 */
  type GetVerificationKey = (req: unknown, token: Jwt | undefined) => Secret | undefined | Promise<Secret | undefined>;

  function expressJwtSecret(options: ExpressJwtOptions): SecretCallbackLong & GetVerificationKey;

  function passportJwtSecret(options: ExpressJwtOptions): SecretCallback;

  type ExpressJwtOptions = Options & {
    handleSigningKeyError?: (err: Error | null, cb: (err: Error | null) => void) => void;
  };

  function hapiJwt2Key(options: HapiJwtOptions): (decodedToken: DecodedToken, cb: HapiCallback) => void;

  type HapiJwtOptions = Options & {
    handleSigningKeyError?: (err: Error | null, cb: HapiCallback) => void;
  };

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

  type KoaJwtOptions = Options & {
    handleSigningKeyError?(err: Error | null): Promise<void>;
  };

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
