export { ArgumentError } from './errors/ArgumentError.js';
export { JwksError } from './errors/JwksError.js';
export { JwksRateLimitError } from './errors/JwksRateLimitError.js';
export { SigningKeyNotFoundError } from './errors/SigningKeyNotFoundError.js';

export { expressJwtSecret } from './integrations/express.js';
export { hapiJwt2Key, hapiJwt2KeyAsync } from './integrations/hapi.js';
export { koaJwtSecret } from './integrations/koa.js';
export { passportJwtSecret } from './integrations/passport.js';

import { JwksClient } from './JwksClient.js';
export { JwksClient } from './JwksClient.js';

export default (options) => {
  return new JwksClient(options);
};
