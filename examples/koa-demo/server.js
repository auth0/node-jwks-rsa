const Koa = require('koa');
const Router = require('koa-router');
const jwt = require('koa-jwt');
const jwksRsa = require('../../lib');

const jwksHost = process.env.JWKS_HOST;
const audience = process.env.AUDIENCE;
const issuer = process.env.ISSUER;

// Initialize the app.
const app = new Koa();

app.use(jwt({
  secret: jwksRsa.koaJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 2,
    jwksUri: `${jwksHost}/.well-known/jwks.json`
  }),
  audience,
  issuer,
  algorithms: [ 'RS256' ]
}));

const router = new Router();

router.get('/me', ctx => {
  ctx.body = ctx.state.user
});

app.use(router.middleware());

// Start the server.
const port = process.env.PORT || 4001;
app.listen(port);
