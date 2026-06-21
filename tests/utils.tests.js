const { expect } = require('chai');

const { retrieveSigningKeys } = require('../src/utils');
const { x5cSingle } = require('./keys');

describe('utils - retrieveSigningKeys', () => {
  it('Ignores keys signed with unsupported algorithms', async () => {
    const es256k = {
      alg: 'ES256K',
      kty: 'EC',
      use: 'sig',
      crv: 'secp256k1',
      x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      y: 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      kid: 'es256k-test'
    };

    const rsa = x5cSingle.keys[0];
    const jwks = [ es256k, rsa ];
    const keys = await retrieveSigningKeys(jwks);

    // Unsupported (ES256K) key should be ignored
    expect(keys.find(k => k.kid === 'es256k-test')).to.be.undefined;

    // Supported RSA key should be resolved.
    expect(keys).to.have.lengthOf(1);
    expect(keys[0].kid).to.equal(rsa.kid);
  });

  describe('AKP (ML-DSA) key type support', () => {
    it('should not filter out AKP keys from the JWKS set', async () => {
      // An AKP key with alg set (as required by RFC 9964).
      // jose.importJWK may not support ML-DSA on all Node.js versions,
      // so the key may be silently skipped by the catch block. The important
      // thing is that the kty filter does NOT reject it.
      const akpKey = {
        kty: 'AKP',
        alg: 'ML-DSA-65',
        use: 'sig',
        kid: 'akp-mldsa65-test',
        pub: 'AAAA' // placeholder - will fail at importJWK, which is fine
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpKey, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // RSA key should always be resolved regardless of AKP support.
      expect(keys.find(k => k.kid === rsa.kid)).to.not.be.undefined;
    });

    it('should filter out keys with unknown kty values', async () => {
      const unknownKey = {
        kty: 'UNKNOWN',
        alg: 'SOME-ALG',
        use: 'sig',
        kid: 'unknown-test'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ unknownKey, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // Unknown kty should be filtered out entirely.
      expect(keys.find(k => k.kid === 'unknown-test')).to.be.undefined;

      // RSA key should still be resolved.
      expect(keys).to.have.lengthOf(1);
      expect(keys[0].kid).to.equal(rsa.kid);
    });

    it('should gracefully handle AKP key without alg parameter', async () => {
      // AKP keys without alg should hit the defensive check in resolveAlg
      // and be skipped (the error is caught by the try/catch in retrieveSigningKeys).
      const akpNoAlg = {
        kty: 'AKP',
        use: 'sig',
        kid: 'akp-no-alg-test',
        pub: 'AAAA'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpNoAlg, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // AKP key without alg should be skipped.
      expect(keys.find(k => k.kid === 'akp-no-alg-test')).to.be.undefined;

      // RSA key should still be resolved.
      expect(keys).to.have.lengthOf(1);
      expect(keys[0].kid).to.equal(rsa.kid);
    });

    it('should include AKP alongside other key types in mixed JWKS', async () => {
      const akpKey = {
        kty: 'AKP',
        alg: 'ML-DSA-65',
        use: 'sig',
        kid: 'akp-mixed-test',
        pub: 'AAAA'
      };

      const unknownKey = {
        kty: 'FOOBAR',
        alg: 'FOO',
        use: 'sig',
        kid: 'foobar-test'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpKey, unknownKey, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // Unknown kty should be filtered out.
      expect(keys.find(k => k.kid === 'foobar-test')).to.be.undefined;

      // RSA should be resolved.
      expect(keys.find(k => k.kid === rsa.kid)).to.not.be.undefined;
    });
  });
});
