const { ArgumentError } = require('../errors');
const { JwksClient } = require('../JwksClient');
const supportedAlg = require('./config');

const handleSigningKeyError = (err, cb) => {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return cb(null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    return cb(err);
  }
};

module.exports.expressJwtSecret = function (options) {
  if (options === null || options === undefined) {
    throw new ArgumentError('An options object must be provided when initializing expressJwtSecret');
  }

  const client = new JwksClient(options);
  const onError = options.handleSigningKeyError || handleSigningKeyError;

  return function secretProvider(req, header, payload, cb) {
    if (!header || !supportedAlg.includes(header.alg)) {
      return cb(null, null);
    }

    client.getSigningKey(header.kid)
      .then(key => {
        cb(null, key.publicKey || key.rsaPublicKey);
      }).catch(err => {
        onError(err, (newError) => cb(newError, null));
      });
  };
};
