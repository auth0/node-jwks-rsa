const Hapi = require('hapi');
const good = require('good');
const jwt = require('hapi-auth-jwt2');
const logger = require('debug')('hapi');
const jwksRsa = require('../../lib');

const jwksHost = process.env.JWKS_HOST;
const audience = process.env.AUDIENCE;
const issuer = process.env.ISSUER;

// Fake validation, accept any authenticated user.
const validateUser = (decoded, request, callback) => {
  logger('Validating user:', decoded);

  if (decoded && decoded.sub) {
    return callback(null, true);
  }

  return callback(null, false);
};

// Start the server.
const server = new Hapi.Server({ debug: { log: [ 'error' ] } });
server.connection({ port: 4001 });
server.register(jwt, (err) => {
  if (err) {
    logger(err);
  }

  server.auth.strategy('jwt', 'jwt', {
    complete: true,
    key: jwksRsa.hapiJwt2Key({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 2,
      jwksUri: `${jwksHost}/.well-known/jwks.json`
    }),
    validateFunc: validateUser,
    verifyOptions: {
      audience: audience,
      issuer: issuer,
      algorithms: [ 'RS256' ]
    }
  });
  server.auth.default('jwt');

  server.route([
    {
      method: 'GET',
      path: '/me',
      config: { auth: 'jwt' },
      handler: (request, reply) => {
        // This is the user object
        reply(request.auth.credentials);
      }
    }
  ]);
});

// Logging.
const options = {
  reporters: {
    console: [
      { module: 'good-console' },
      'stdout'
    ]
  }
};

server.register({ register: good, options }, (err) => {
  if (err) {
    return logger(err);
  }

  server.start(() => {
    logger('Server running at:', server.info.uri);
  });
});
