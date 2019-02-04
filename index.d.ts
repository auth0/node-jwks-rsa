declare module 'jwks-rsa' {
  import * as ExpressJwt from 'express-jwt';

  function JwksRsa(options: JwksRsa.ClientOptions): JwksRsa.JwksClient;

  namespace JwksRsa {
    class JwksClient {
      constructor(options: ClientOptions);

      getKeys(cb: (err: Error | null, keys: unknown) => void): void;
      getSigningKeys(cb: (err: Error | null, keys: SigningKey[]) => void): void;
      getSigningKey: (kid: string, cb: (err: Error | null, key: SigningKey) => void) => void;
    }

    interface ClientOptions {
      jwksUri: string;
      rateLimit?: boolean;
      cache?: boolean;
      cacheMaxEntries?: number;
      cacheMaxAge?: number;
      jwksRequestsPerMinute?: number;
      strictSsl?: boolean;
    }

    interface CertSigningKey {
      kid: string;
      nbf: string;
      publicKey: string;
    }

    interface RsaSigningKey {
      kid: string;
      nbf: string;
      rsaPublicKey;
    }

    type SigningKey = CertSigningKey | RsaSigningKey;

    function expressJwtSecret(options: ExpressJwtOptions): ExpressJwt.SecretCallbackLong;

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

    function hapiJwt2KeyAsync(options: HapiJwtOptions): (decodedToken: DecodedToken) => Promise<{ key: SigningKey }>;

    function koaJwtSecret(options: KoaJwtOptions): (header: TokenHeader) => Promise<string>;

    interface KoaJwtOptions extends ClientOptions {
      handleSigningKeyError?(err: Error | null): Promise<void>;
    }

    class ArgumentError extends Error {
      constructor(message: string);

      name: 'ArgumentError';
    }

    class JwksError extends Error {
      constructor(message: string);

      name: 'JwksError';
    }

    class JwksRateLimitError extends Error {
      constructor(message: string);

      name: 'JwksRateLimitError';
    }

    class SigningKeyNotFoundError extends Error {
      constructor(message: string);

      name: 'SigningKeyNotFoundError';
    }
  }

  export = JwksRsa;
}
