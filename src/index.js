import JwksClient from './JwksClient';

module.exports = (options) => {
  return new JwksClient(options);
};

module.exports.expressJwtSecretProvider = (options) => {
  const client = new JwksClient(options);
  return function secretProvider(req, header, payload, cb) {
    if (header.alg !== 'RS256') {
      return cb(new Error(`Unsupported algorithm '${header.alg}'`));
    }

    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return cb(err);
      }

      if (!key) {
        return cb(new Error(`Unable to find a signing key for '${header.id}'`));
      }

      return cb(null, key.publicKey || key.rsaPublicKey);
    });
  };
};

module.exports.hapiJwt2KeyProvider = (options) => {
  const client = new JwksClient(options);
  return function keyProvider(decoded, cb) {
    if (decoded.alg !== 'RS256') {
      return cb(new Error(`Unsupported algorithm '${header.alg}'`));
    }

    client.getSigningKey(decoded.kid, (err, key) => {
      if (err) {
        return cb(err);
      }

      if (!key) {
        return cb(new Error(`Unable to find a signing key for '${header.id}'`));
      }

      return decoded(null, key.publicKey || key.rsaPublicKey, key);
    });
  };
};
