const logger = require('debug')('jwks');
const { RateLimiter } = require('limiter');

const JwksRateLimitError = require('../errors/JwksRateLimitError');

function rateLimitWrapper(client, { jwksRequestsPerMinute = 10 }) {
  const getSigningKey = client.getSigningKey.bind(client);

  const limiter = new RateLimiter(jwksRequestsPerMinute, 'minute', true);
  logger(`Configured rate limiting to JWKS endpoint at ${jwksRequestsPerMinute}/minute`);

  return async (kid) => {
    logger('Requests to the JWKS endpoint available for the next minute:', limiter.getTokensRemaining());
    if (limiter.tryRemoveTokens(1)) {
      return getSigningKey(kid);
    }
    logger('Too many requests to the JWKS endpoint');
    throw new JwksRateLimitError('Too many requests to the JWKS endpoint');
  };
}

module.exports.default = rateLimitWrapper;
