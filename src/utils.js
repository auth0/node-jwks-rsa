const jose = require('jose');

function retrieveSigningKeys(keys) {
  const keystore = jose.JWKS.asKeyStore({ keys }, { ignoreErrors: true });

  return keystore.all({ use: 'sig' }).map((key) => {
    return {
      kid: key.kid,
      alg: key.alg,
      get publicKey() { return key.toPEM(false); },
      get rsaPublicKey() { return key.toPEM(false); },
      getPublicKey() { return key.toPEM(false); }
    };
  });
}

module.exports = {
  retrieveSigningKeys
};
