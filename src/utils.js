const jose = require('jose');
const crypto = require('crypto');

async function retrieveSigningKeys(jwks) {
  const results = [];

  jwks = jwks
    .filter(({ use }) => use === 'sig' || use === undefined)
    .filter(({ kty }) => kty === 'RSA' || kty === 'EC' || kty === 'OKP');

  for (const jwk of jwks) {
    try {
      // The algorithm is actually not used in the Node.js KeyObject-based runtime
      // passing an arbitrary value here and checking that KeyObject was returned
      // later
      const keyObject = await jose.importJWK(jwk, 'RS256');
      if (!(keyObject instanceof crypto.KeyObject) || keyObject.type !== 'public') {
        continue;
      }
      const getSpki = () => keyObject.export({ format: 'pem', type: 'spki' });
      results.push({
        get publicKey() { return getSpki(); },
        get rsaPublicKey() { return getSpki(); },
        getPublicKey() { return getSpki(); },
        ...(typeof jwk.kid === 'string' && jwk.kid ? { kid: jwk.kid } : undefined),
        ...(typeof jwk.alg === 'string' && jwk.alg ? { alg: jwk.alg } : undefined)
      });
    } catch (err) {
      continue;
    }
  }

  return results;
}

module.exports = {
  retrieveSigningKeys
};
