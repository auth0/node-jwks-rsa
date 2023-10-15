import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import type { Jwt, Secret } from 'jsonwebtoken';
import Express from 'express';

declare class JwksClient {
  constructor(options: Options);

  getKeys(): Promise<unknown>;
  getSigningKeys(): Promise<SigningKey[]>;
  getSigningKey(kid?: string | null | undefined): Promise<SigningKey>;
  getSigningKey(kid: string | null | undefined, cb: (err: Error | null, key?: SigningKey) => void): void;
}

export interface Headers {
  [key: string]: string;
}

export interface Options {
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
  getKeysInterceptor?: () => Promise<JSONWebKey[]>;
}

export interface JSONWebKey {
  kid: string;
  alg: string;
  [key: string]: any;
}

export interface CertSigningKey {
  kid: string;
  alg: string;
  getPublicKey(): string;
  publicKey: string;
}

export interface RsaSigningKey {
  kid: string;
  alg: string;
  getPublicKey(): string;
  rsaPublicKey: string;
}

export type SigningKey = CertSigningKey | RsaSigningKey;

/**
 * Types are duplicated from express-jwt@6/7 due to numerous breaking changes in the lib's types whilst this lib
 * supportd both <=6 & >=7 implementations
 *
 * Express-jwt's installed version (or its @types) will be the types used at transpilation time
 */

/** Types from express-jwt@<=6 */
export type secretType = string | Buffer;
export type SecretCallbackLong = (
  req: Express.Request,
  header: any,
  payload: any,
  done: (err: any, secret?: secretType) => void
) => void;
export type SecretCallback = (req: Express.Request, payload: any, done: (err: any, secret?: secretType) => void) => void;

/** Types from express-jwt@>=7 */
export type GetVerificationKey = (
  req: Express.Request,
  token: Jwt | undefined
) => Secret | undefined | Promise<Secret | undefined>;

export interface ExpressJwtOptions extends Options {
  handleSigningKeyError?: (err: Error | null, cb: (err: Error | null) => void) => void;
}

export interface HapiJwtOptions extends Options {
  handleSigningKeyError?: (err: Error | null, cb: HapiCallback) => void;
}

export type HapiCallback = (err: Error | null, publicKey: string, signingKey: SigningKey) => void;

export interface DecodedToken {
  header: TokenHeader;
}

export interface TokenHeader {
  alg: string;
  kid: string;
}

export interface KoaJwtOptions extends Options {
  handleSigningKeyError?(err: Error | null): Promise<void>;
}
