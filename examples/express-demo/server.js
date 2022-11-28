const Express = require('express');
const { expressjwt: jwt } = require('express-jwt');
const logger = require('debug')('express');
const { expressJwtSecret } = require('../../src');

const jwksHost = process.env.JWKS_HOST;
const audience = process.env.AUDIENCE;
const issuer = process.env.ISSUER;

// Initialize the app.
const app = new Express();
app.use(jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 2,
    jwksUri: `${jwksHost}/.well-known/jwks.json`
  }),
  audience: audience,
  issuer: issuer,
  algorithms: [ 'RS256' ]
}));

app.get('/me', (req, res) => {
  res.json(req.user);
});

app.use((err, req, res, next) => {
  logger(err.name, err.message);
  res.json({
    name: err.name,
    message: err.message
  });
});

// Start the server.
const port = process.env.PORT || 4001;
app.listen(port, function(error) {
  if (error) {
    logger(error);
  } else {
    logger('Listening on http://localhost:' + port);
  }
});
