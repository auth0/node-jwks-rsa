const Hapi = require('@hapi/hapi');
const jwt = require('hapi-auth-jwt2');
const jwksRsa = require('jwks-rsa');

const jwksHost = process.env.JWKS_HOST;
const audience = process.env.AUDIENCE;
const issuer = process.env.ISSUER;

// Fake validation, accept any authenticated user.
const validateUser = async (decoded) => {
  console.log(decoded);
  if (decoded && decoded.sub) {
    return {
      isValid: true
    }
  } else {
    return {
      isValid: false
    }
  }
};

const init = async () => {
  // eslint-disable-next-line new-cap
  const server = new Hapi.server({
    port: 4001,
    host: 'localhost'
  });
  await server.register(jwt);
  // jwks-rsa strategy
  server.auth.strategy('jwt', 'jwt', {
    complete: true,
    headerKey: 'authorization',
    tokenType: 'Bearer',
    key: jwksRsa.hapiJwt2KeyAsync({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 2,
      jwksUri: `${jwksHost}/.well-known/jwks.json`
    }),
    validate: validateUser,
    verifyOptions: {
      audience: audience,
      issuer: issuer,
      algorithms: ['RS256']
    }
  });
  server.auth.default('jwt');

  server.route([
    {
      method: 'GET',
      path: '/me',
      config: { auth: 'jwt' },
      handler: (request, h) => {
        // This is the user object
        return (request.auth.credentials)
      }
    }
  ]);
  await server.start();
  return server;
};

init()
  .then(server => {
    console.log(`Server running at: ${server.info.uri}`);
  })
  .catch(err => {
    console.error(err);
  });
