const fastify = require('fastify')();
const fastifyJwt = require('fastify-jwt');
const jwksRsa = require('../../');

fastify.post('/signup', (request, reply) => {
  reply.jwtSign(request.body, (err, token) => {
    return reply.send(err || { 'token': token });
  });
});

fastify.register(fastifyJwt, {
  secret: jwksRsa.fastifyJwtSecret({
    jwksUri: 'http://localhost/.well-known/jwks.json'
  }),
  algorithms: [ 'RS256' ]
});

const start = async () => {
  try {
    await fastify.listen(9000);
    console.log(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
