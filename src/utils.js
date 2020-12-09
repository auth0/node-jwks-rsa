import jose from 'jose';
import JwksError from './errors/JwksError';

export function retrieveSigningKeys(keys) {
  let keystore = [];
  try {
    keystore = jose.JWKS.asKeyStore({ keys }, { ignoreErrors: true });
  } catch (err) {
    return cb(new JwksError(err.message));
  }
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
