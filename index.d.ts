import { SecretCallback, SecretCallbackLong } from 'express-jwt';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

declare function JwksRsa(options: JwksRsa.Options): JwksRsa.JwksClient;

declare namespace JwksRsa {
  class JwksClient {
    constructor(options: Options);

    getKeys(): Promise<unknown>;
    getSigningKeys(): Promise<SigningKey[]>;
    getSigningKey(kid?: string | null | undefined): Promise<SigningKey>;
    getSigningKey(kid: string | null | undefined, cb: (err: Error | null, key: SigningKey) => void): void;
  }

  interface Headers {
    [key: string]: string;
  }

  interface Options {
    jwksUri: string;
    rateLimit?: boolean;
    cache?: boolean;
    cacheMaxEntries?: number;
    cacheMaxAge?: number;
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

  function expressJwtSecret(options: ExpressJwtOptions): SecretCallbackLong;

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
