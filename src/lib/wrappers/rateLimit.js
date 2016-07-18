import debug from 'debug';
import { RateLimiter } from 'limiter';

export default function(fn, { jwksRequestsPerMinute = 10 } = options) {
  const logger = debug('jwks');
  const getSigningKey = fn;

  const limiter = new RateLimiter(jwksRequestsPerMinute, 'minute', true);
  logger(`Configured rate limiting to JWKS endpoint at ${jwksRequestsPerMinute}/minute`);

  return (kid, cb) => {
    limiter.removeTokens(1, (err, remaining) => {
      if (err) {
        return cb(err);
      }

      logger('Requests to the JWKS endpoint available for the next minute:', remaining);
      if (remaining < 0) {
        logger('Too Many Requests to the JWKS endpoint');
        return cb(new Error('Too Many Requests to the JWKS endpoint'));
      } else {
        return getSigningKey(kid, cb);
      }
    });
  };
}
