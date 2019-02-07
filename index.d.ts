declare module 'jwks-rsa' {

  import * as ExpressJwt from "express-jwt";

  function JwksRsa(options: JwksRsa.Options): JwksRsa.JwksClient;

  namespace JwksRsa {
    class JwksClient {
      constructor(options: Options);

      getKeys: (cb: (err: Error, keys: Jwk[]) => any) => any;
      getSigningKeys: (cb: (err: Error, keys: Jwk[]) => any) => any;
      getSigningKey: (kid: string, cb: (err: Error, key: Jwk) => any) => any;
    }

    interface Jwk {
      kid: string;
      nbf?: number;
      publicKey?: string;
      rsaPublicKey?: string;
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
      strictSsl?: boolean;
      requestHeaders?: Headers;
      handleSigningKeyError?(err: Error, cb: (err: Error) => void): any;
    }

    function expressJwtSecret(options: JwksRsa.Options): ExpressJwt.SecretCallback;

    function hapiJwt2Key(options: JwksRsa.Options): (name: string, scheme: string, options?: any) => void;

    function hapiJwt2KeyAsync(options: JwksRsa.Options): (name: string, scheme: string, options?: any) => void;

    function koaJwtSecret(options: JwksRsa.Options): (name: string, scheme: string, options?: any) => void;

    class ArgumentError extends Error {
      constructor(message: string);
    }

    class JwksError extends Error {
      constructor(message: string);
    }

    class JwksRateLimitError extends Error {
      constructor(message: string);
    }

    class SigningKeyNotFoundError extends Error {
      constructor(message: string);
    }
  }

  export = JwksRsa;
}
