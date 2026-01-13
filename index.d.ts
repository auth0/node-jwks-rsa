/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import type { Jwt, Secret } from 'jsonwebtoken';

/** Namespace for types */
declare namespace JWKSRsaTypes {
  class JwksClient {
    constructor(options: Options);
    getKeys(): Promise<unknown>;
    getSigningKeys(): Promise<SigningKey[]>;
    getSigningKey(kid?: string | null | undefined): Promise<SigningKey>;
    getSigningKey(kid: string | null | undefined, cb: (err: Error | null, key?: SigningKey) => void): void;
  }
  interface Headers { [key: string]: string; }
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
    fetcher?(jwksUri: string): Promise<{ keys: any }>; // eslint-disable-line @typescript-eslint/no-explicit-any
    getKeysInterceptor?(): Promise<JSONWebKey[]>;
  }
  interface JSONWebKey { kid: string; alg: string; [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
  interface CertSigningKey { kid?: string; alg?: string; getPublicKey(): string; publicKey: string; }
  interface RsaSigningKey { kid?: string; alg?: string; getPublicKey(): string; rsaPublicKey: string; }
  type SigningKey = CertSigningKey | RsaSigningKey;
  // express-jwt <=6
  type secretType = string | Buffer;
  type SecretCallbackLong = (req: unknown, header: any, payload: any, done: (err: any, secret?: secretType) => void) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  type SecretCallback = (req: unknown, payload: any, done: (err: any, secret?: secretType) => void) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  // express-jwt >=7
  type GetVerificationKey = (req: unknown, token: Jwt | undefined) => Secret | undefined | Promise<Secret | undefined>;
  function expressJwtSecret(options: ExpressJwtOptions): SecretCallbackLong & GetVerificationKey;
  function passportJwtSecret(options: ExpressJwtOptions): SecretCallback;
  interface ExpressJwtOptions extends Options { handleSigningKeyError?: (err: Error | null, cb: (err: Error | null) => void) => void; }
  function hapiJwt2Key(options: HapiJwtOptions): (decodedToken: DecodedToken, cb: HapiCallback) => void;
  interface HapiJwtOptions extends Options { handleSigningKeyError?: (err: Error | null, cb: HapiCallback) => void; }
  type HapiCallback = (err: Error | null, publicKey: string | undefined, signingKey: SigningKey | undefined) => void;
  interface DecodedToken { header: TokenHeader; }
  interface TokenHeader { alg: string; kid: string; }
  function hapiJwt2KeyAsync(options: HapiJwtOptions): (decodedToken: DecodedToken) => Promise<{ key: string }>;
  function koaJwtSecret(options: KoaJwtOptions): (header: TokenHeader) => Promise<string>;
  interface KoaJwtOptions extends Options { handleSigningKeyError?(err: Error | null): Promise<void>; }
  class ArgumentError extends Error { name: string; constructor(message: any); }
  class JwksError extends Error { name: string; constructor(message: any); }
  class JwksRateLimitError extends Error { name: string; constructor(message: any); }
  class SigningKeyNotFoundError extends Error { name: string; constructor(message: any); }
}

/** Shape of callable default export */
export interface JWKSRSAModule {
  (options: JWKSRsaTypes.Options): JWKSRsaTypes.JwksClient;
  JwksClient: typeof JWKSRsaTypes.JwksClient;
  ArgumentError: typeof JWKSRsaTypes.ArgumentError;
  JwksError: typeof JWKSRsaTypes.JwksError;
  JwksRateLimitError: typeof JWKSRsaTypes.JwksRateLimitError;
  SigningKeyNotFoundError: typeof JWKSRsaTypes.SigningKeyNotFoundError;
  expressJwtSecret: typeof JWKSRsaTypes.expressJwtSecret;
  passportJwtSecret: typeof JWKSRsaTypes.passportJwtSecret;
  hapiJwt2Key: typeof JWKSRsaTypes.hapiJwt2Key;
  hapiJwt2KeyAsync: typeof JWKSRsaTypes.hapiJwt2KeyAsync;
  koaJwtSecret: typeof JWKSRsaTypes.koaJwtSecret;
}

declare const jwksRsa: JWKSRSAModule;
export default jwksRsa;
export { JWKSRsaTypes as JwksRsa };
export type { HttpAgent, HttpsAgent };
// Named re-exports
export const JwksClient: typeof JWKSRsaTypes.JwksClient;
export const ArgumentError: typeof JWKSRsaTypes.ArgumentError;
export const JwksError: typeof JWKSRsaTypes.JwksError;
export const JwksRateLimitError: typeof JWKSRsaTypes.JwksRateLimitError;
export const SigningKeyNotFoundError: typeof JWKSRsaTypes.SigningKeyNotFoundError;
export const expressJwtSecret: typeof JWKSRsaTypes.expressJwtSecret;
export const passportJwtSecret: typeof JWKSRsaTypes.passportJwtSecret;
export const hapiJwt2Key: typeof JWKSRsaTypes.hapiJwt2Key;
export const hapiJwt2KeyAsync: typeof JWKSRsaTypes.hapiJwt2KeyAsync;
export const koaJwtSecret: typeof JWKSRsaTypes.koaJwtSecret;
