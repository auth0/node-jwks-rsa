import { importJWK, exportSPKI } from 'jose';

import { JwksError } from './errors/JwksError.js';

// @ts-ignore
function resolveAlg(jwk) {
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
      case 'secp256k1':
        return 'ES256K';
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

// @ts-ignore
export async function retrieveSigningKeys(jwks) {
  const results = [];

  jwks = jwks
  // @ts-ignore
    .filter(({ use }) => use === 'sig' || use === undefined)
    // @ts-ignore
    .filter(({ kty }) => kty === 'RSA' || kty === 'EC' || kty === 'OKP');

  for (const jwk of jwks) {
    try {
      const key = await importJWK(jwk, resolveAlg(jwk));
      // @ts-ignore
      if (key.type !== 'public') {
        continue;
      }
      // @ts-ignore
      let getSpki;
      // @ts-ignore
      switch (key[Symbol.toStringTag]) {
        case 'CryptoKey': {
          // @ts-ignore
          const spki = await exportSPKI(key);
          getSpki = () => spki;
          break;
        }
        case 'KeyObject':
        // Assume legacy Node.js version without the Symbol.toStringTag backported
        // Fall through
        default:
          // @ts-ignore
          getSpki = () => key.export({ format: 'pem', type: 'spki' });
      }
      results.push({
        get publicKey() {
          // @ts-ignore
          return getSpki();
        },
        get rsaPublicKey() {
          // @ts-ignore
          return getSpki();
        },
        getPublicKey() {
          // @ts-ignore
          return getSpki();
        },
        ...(typeof jwk.kid === 'string' && jwk.kid ? { kid: jwk.kid } : undefined),
        ...(typeof jwk.alg === 'string' && jwk.alg ? { alg: jwk.alg } : undefined)
      });
    } catch (err) {
      continue;
    }
  }

  return results;
}
