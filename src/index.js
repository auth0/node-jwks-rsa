import { JwksClient } from './JwksClient.js';
import * as errors from './errors/index.js';
import { hapiJwt2Key, hapiJwt2KeyAsync } from './integrations/hapi.js';
import { expressJwtSecret } from './integrations/express.js';
import { koaJwtSecret } from './integrations/koa.js';
import { passportJwtSecret } from './integrations/passport.js';

function jwksRsa(options) {
  return new JwksClient(options);
}

// Attach properties for backwards compatibility
jwksRsa.JwksClient = JwksClient;
jwksRsa.ArgumentError = errors.ArgumentError;
jwksRsa.JwksError = errors.JwksError;
jwksRsa.JwksRateLimitError = errors.JwksRateLimitError;
jwksRsa.SigningKeyNotFoundError = errors.SigningKeyNotFoundError;
jwksRsa.expressJwtSecret = expressJwtSecret;
jwksRsa.hapiJwt2Key = hapiJwt2Key;
jwksRsa.hapiJwt2KeyAsync = hapiJwt2KeyAsync;
jwksRsa.koaJwtSecret = koaJwtSecret;
jwksRsa.passportJwtSecret = passportJwtSecret;

export default jwksRsa;
export { JwksClient };
export const ArgumentError = errors.ArgumentError;
export const JwksError = errors.JwksError;
export const JwksRateLimitError = errors.JwksRateLimitError;
export const SigningKeyNotFoundError = errors.SigningKeyNotFoundError;
export { expressJwtSecret, hapiJwt2Key, hapiJwt2KeyAsync, koaJwtSecret, passportJwtSecret };
