const fastify = require('fastify')();
const fastifyJwt = require('fastify-jwt');
const JwksClient = require('../../lib/');

fastify.get('/auth-required', async request => {
  try {
    const decoded = await request.jwtVerify();
    return { decoded };
  } catch (err) {
    return err;
  }
});

fastify.register(fastifyJwt, {
  secret: JwksClient.fastifyJwtSecret({
    jwksUri: 'http://localhost/.well-known/jwks.json'
  }),
  algorithms: [ 'RS256' ],
  decode: { complete: true }
});

const start = async () => {
  try {
    const address = await fastify.listen(9000,'0.0.0.0');
    console.log(`Server running on ${address}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
