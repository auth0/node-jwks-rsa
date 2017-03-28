import { JwksClient } from './JwksClient';

import * as errors from './errors';
import { hapiJwt2Key } from './integrations/hapi';
import { expressJwtSecret } from './integrations/express';
import { koaJwtSecret } from './integrations/koa';

module.exports = (options) => {
  return new JwksClient(options);
};

module.exports.ArgumentError = errors.ArgumentError;
module.exports.JwksError = errors.JwksError;
module.exports.JwksRateLimitError = errors.JwksRateLimitError;
module.exports.SigningKeyNotFoundError = errors.SigningKeyNotFoundError;

module.exports.expressJwtSecret = expressJwtSecret;
module.exports.hapiJwt2Key = hapiJwt2Key;
module.exports.koaJwtSecret = koaJwtSecret;
