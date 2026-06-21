const jose = require('jose');
const JwksError = require('./errors/JwksError');

function resolveAlg(jwk) {
  // AKP (RFC 9964) must be validated before the generic alg early-return
  // to enforce that only ML-DSA algorithms are accepted for this key type.
  if (jwk.kty === 'AKP') {
    const validAKPAlgs = ['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87'];
    if (!jwk.alg || !validAKPAlgs.includes(jwk.alg)) {
      throw new JwksError('AKP JWK requires a valid "alg" parameter (ML-DSA-44, ML-DSA-65, or ML-DSA-87)');
    }
    return jwk.alg;
  }

  if (jwk.alg) {
    return jwk.alg;
  }

  if (jwk.kty === 'RSA') {
    return 'RS256';
  }

  if (jwk.kty === 'EC') {
    switch (jwk.crv) {
      case 'P-256':
        return 'ES256';
      case 'P-384':
        return 'ES384';
      case 'P-521':
        return 'ES512';
    }
  }

  if (jwk.kty === 'OKP') {
    switch (jwk.crv) {
      case 'Ed25519':
      case 'Ed448':
        return 'EdDSA';
    }
  }

  throw new JwksError('Unsupported JWK');
}

async function retrieveSigningKeys(jwks) {
  const results = [];

  jwks = jwks
    .filter(({ use }) => use === 'sig' || use === undefined)
    // AKP (ML-DSA / post-quantum) keys are accepted by the kty filter but
    // ML-DSA support requires Node.js >= 24.7.0 with OpenSSL 3.5+.
    // On older runtimes jose.importJWK will throw and the key will be
    // silently skipped by the catch block below.
    .filter(({ kty }) => kty === 'RSA' || kty === 'EC' || kty === 'OKP' || kty === 'AKP');

  for (const jwk of jwks) {
    // Validate AKP structural requirements before attempting import.
    if (jwk.kty === 'AKP') {
      if (!jwk.pub) {
        continue; // AKP JWK must contain a "pub" (public key) parameter
      }
      if (jwk.priv) {
        continue; // Public JWKS endpoints must never expose private key material
      }
    }
    try {
      const key = await jose.importJWK({ ...jwk, ext: true }, resolveAlg(jwk));
      if (key.type !== 'public') {
        continue;
      }
      let getSpki;
      switch (key[Symbol.toStringTag]) {
        case 'CryptoKey': {
          const spki = await jose.exportSPKI(key);
          getSpki = () => spki;
          break;
        }
        case 'KeyObject':
          // Assume legacy Node.js version without the Symbol.toStringTag backported
          // Fall through
        default:
          getSpki = () => key.export({ format: 'pem', type: 'spki' });
      }
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
