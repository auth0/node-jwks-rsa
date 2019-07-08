const Express = require('express');
const logger = require('debug')('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwksRsa = require('../../lib');

const jwksHost = process.env.JWKS_HOST;
const audience = process.env.AUDIENCE;
const issuer = process.env.ISSUER;

// Fake verify, accept any authenticated user.
const verify = (jwt_payload, done) => {
  logger('Verify user:', jwt_payload);

  if (jwt_payload && jwt_payload.sub) {
    return done(null, jwt_payload);
  }

  return done(null, false);
};

// Initialize the app.
const app = new Express();
passport.use(
  new JwtStrategy({
    // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
    secretOrKeyProvider: jwksRsa.passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${jwksHost}/.well-known/jwks.json`
    }),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

    // Validate the audience and the issuer.
    audience: audience,
    issuer: issuer,
    algorithms: ['RS256']
  },
  verify)
);

app.use(passport.initialize());

app.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
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
