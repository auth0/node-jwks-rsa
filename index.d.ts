import { SecretCallback, SecretCallbackLong } from 'express-jwt';

declare function JwksRsa(options: JwksRsa.ClientOptions): JwksRsa.JwksClient;

declare namespace JwksRsa {
  class JwksClient {
    constructor(options: ClientOptions);

    getKeys(cb: (err: Error | null, keys: unknown) => void): void;
    getKeysAsync(): Promise<unknown>;
    getSigningKeys(cb: (err: Error | null, keys: SigningKey[]) => void): void;
    getSigningKeysAsync(): Promise<SigningKey[]>;
    getSigningKey(kid: string, cb: (err: Error | null, key: SigningKey) => void): void;
    getSigningKeyAsync(kid: string): Promise<SigningKey>;
  }

  interface Headers {
    [key: string]: string;
  }

  interface ClientOptions {
    jwksUri: string;
    rateLimit?: boolean;
    cache?: boolean;
    cacheMaxEntries?: number;
    cacheMaxAge?: number;
    jwksRequestsPerMinute?: number;
    proxy?: string;
    strictSsl?: boolean;
    requestHeaders?: Headers;
    timeout?: number;
  }

  interface CertSigningKey {
    kid: string;
    nbf: string;
    getPublicKey(): string;
    publicKey: string;
  }

  interface AgentOptions {
    [key: string]: string;
  }

  interface Options {
    jwksUri: string;
    rateLimit?: boolean;
    cache?: boolean;
    cacheMaxEntries?: number;
    cacheMaxAge?: number;
    jwksRequestsPerMinute?: number;
    strictSsl?: boolean;
    requestHeaders?: Headers;
    requestAgentOptions?: AgentOptions;
    handleSigningKeyError?(err: Error, cb: (err: Error) => void): any;
  }

  interface RsaSigningKey {
    kid: string;
    nbf: string;
    getPublicKey(): string;
    rsaPublicKey: string;
  }

  type SigningKey = CertSigningKey | RsaSigningKey;

  function expressJwtSecret(options: ExpressJwtOptions): SecretCallbackLong;

  function passportJwtSecret(options: ExpressJwtOptions): SecretCallback;

  interface ExpressJwtOptions extends ClientOptions {
    handleSigningKeyError?: (err: Error | null, cb: (err: Error | null) => void) => void;
  }

  function hapiJwt2Key(options: HapiJwtOptions): (decodedToken: DecodedToken, cb: HapiCallback) => void;

  interface HapiJwtOptions extends ClientOptions {
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

  interface KoaJwtOptions extends ClientOptions {
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
