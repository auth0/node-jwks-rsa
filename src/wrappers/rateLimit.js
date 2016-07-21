import debug from 'debug';
import { RateLimiter } from 'limiter';

import JwksRateLimitError from '../errors/JwksRateLimitError';

export default function(client, { jwksRequestsPerMinute = 10 } = options) {
  const logger = debug('jwks');
  const getSigningKey = client.getSigningKey;

  const limiter = new RateLimiter(jwksRequestsPerMinute, 'minute', true);
  logger(`Configured rate limiting to JWKS endpoint at ${jwksRequestsPerMinute}/minute`);

  return (kid, cb) => {
    limiter.removeTokens(1, (err, remaining) => {
      if (err) {
        return cb(err);
      }

      logger('Requests to the JWKS endpoint available for the next minute:', remaining);
      if (remaining < 0) {
        logger('Too many requests to the JWKS endpoint');
        return cb(new JwksRateLimitError('Too many requests to the JWKS endpoint'));
      } else {
        return getSigningKey(kid, cb);
      }
    });
  };
}
