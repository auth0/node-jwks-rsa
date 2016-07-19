import JwksClient from './JwksClient';

module.exports = (options) => {
  return new JwksClient(options);
};

module.exports.expressJwtSecret = (options) => {
  const client = new JwksClient(options);

  return function secretProvider(req, header, payload, cb) {
    if (header.alg !== 'RS256') {
      return cb(new Error(`Unsupported algorithm '${header.alg}'`));
    }

    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return cb(err);
      }

      return cb(null, key.publicKey || key.rsaPublicKey);
    });
  };
};

module.exports.hapiJwt2Key = (options) => {
  const client = new JwksClient(options);
  return function keyProvider(decoded, cb) {
    if (!decoded.header) {
      return cb(new Error('The decoded token did not contain a header'));
    }

    if (decoded.header.alg !== 'RS256') {
      return cb(new Error(`Unsupported algorithm '${decoded.header.alg}'`));
    }

    client.getSigningKey(decoded.header.kid, (err, key) => {
      if (err) {
        return cb(err);
      }

      return cb(null, key.publicKey || key.rsaPublicKey, key);
    });
  };
};
