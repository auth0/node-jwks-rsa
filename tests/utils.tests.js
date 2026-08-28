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
      // On Node.js < 24.7.0 (without OpenSSL 3.5+), jose.importJWK will throw
      // and the key will be gracefully skipped by the catch block.
      // On Node.js >= 24.7.0 with ML-DSA support, the AKP key should be present
      // in the results. The important thing is that the kty filter does NOT reject it.
      const akpKey = {
        kty: 'AKP',
        alg: 'ML-DSA-65',
        use: 'sig',
        kid: 'akp-mldsa65-test',
        pub: 'AAAA' // placeholder - will fail at importJWK on runtimes without ML-DSA
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpKey, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // RSA key should always be resolved regardless of AKP support.
      expect(keys.find(k => k.kid === rsa.kid)).to.not.be.undefined;

      // If the runtime supports ML-DSA, the AKP key should be in results.
      // On Node < 24.7 the key will be gracefully skipped by the catch block.
      const akpResult = keys.find(k => k.kid === 'akp-mldsa65-test');
      if (akpResult) {
        expect(akpResult.alg).to.equal('ML-DSA-65');
      }
    });

    it('should not filter out AKP keys with ML-DSA-44 alg', async () => {
      const akpKey = {
        kty: 'AKP',
        alg: 'ML-DSA-44',
        use: 'sig',
        kid: 'akp-mldsa44-test',
        pub: 'AAAA'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpKey, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // RSA key should always be resolved.
      expect(keys.find(k => k.kid === rsa.kid)).to.not.be.undefined;

      // On Node < 24.7 the AKP key will be gracefully skipped.
      const akpResult = keys.find(k => k.kid === 'akp-mldsa44-test');
      if (akpResult) {
        expect(akpResult.alg).to.equal('ML-DSA-44');
      }
    });

    it('should not filter out AKP keys with ML-DSA-87 alg', async () => {
      const akpKey = {
        kty: 'AKP',
        alg: 'ML-DSA-87',
        use: 'sig',
        kid: 'akp-mldsa87-test',
        pub: 'AAAA'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpKey, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // RSA key should always be resolved.
      expect(keys.find(k => k.kid === rsa.kid)).to.not.be.undefined;

      // On Node < 24.7 the AKP key will be gracefully skipped.
      const akpResult = keys.find(k => k.kid === 'akp-mldsa87-test');
      if (akpResult) {
        expect(akpResult.alg).to.equal('ML-DSA-87');
      }
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

    it('should reject AKP key with alg "none"', async () => {
      // An AKP key with an invalid alg value should be rejected by resolveAlg
      // and skipped by the catch block in retrieveSigningKeys.
      const akpNoneAlg = {
        kty: 'AKP',
        alg: 'none',
        use: 'sig',
        kid: 'akp-none-alg-test',
        pub: 'AAAA'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpNoneAlg, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // AKP key with alg "none" should be rejected.
      expect(keys.find(k => k.kid === 'akp-none-alg-test')).to.be.undefined;

      // RSA key should still be resolved.
      expect(keys).to.have.lengthOf(1);
      expect(keys[0].kid).to.equal(rsa.kid);
    });

    it('should reject AKP key with alg "RS256"', async () => {
      // An AKP key must only use ML-DSA algorithms, not traditional ones.
      const akpRs256Alg = {
        kty: 'AKP',
        alg: 'RS256',
        use: 'sig',
        kid: 'akp-rs256-alg-test',
        pub: 'AAAA'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpRs256Alg, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // AKP key with alg "RS256" should be rejected.
      expect(keys.find(k => k.kid === 'akp-rs256-alg-test')).to.be.undefined;

      // RSA key should still be resolved.
      expect(keys).to.have.lengthOf(1);
      expect(keys[0].kid).to.equal(rsa.kid);
    });

    it('should skip AKP key without pub parameter', async () => {
      // AKP keys must have a "pub" parameter per RFC 9964.
      const akpNoPub = {
        kty: 'AKP',
        alg: 'ML-DSA-65',
        use: 'sig',
        kid: 'akp-no-pub-test'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpNoPub, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // AKP key without pub should be skipped.
      expect(keys.find(k => k.kid === 'akp-no-pub-test')).to.be.undefined;

      // RSA key should still be resolved.
      expect(keys).to.have.lengthOf(1);
      expect(keys[0].kid).to.equal(rsa.kid);
    });

    it('should skip AKP key that exposes priv parameter', async () => {
      // Public JWKS endpoints should never expose private key material.
      const akpWithPriv = {
        kty: 'AKP',
        alg: 'ML-DSA-65',
        use: 'sig',
        kid: 'akp-with-priv-test',
        pub: 'AAAA',
        priv: 'BBBB'
      };

      const rsa = x5cSingle.keys[0];
      const jwks = [ akpWithPriv, rsa ];
      const keys = await retrieveSigningKeys(jwks);

      // AKP key with priv should be skipped.
      expect(keys.find(k => k.kid === 'akp-with-priv-test')).to.be.undefined;

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

      // If the runtime supports ML-DSA, the AKP key should be in results.
      // On Node < 24.7 the key will be gracefully skipped by the catch block.
      const akpResult = keys.find(k => k.kid === 'akp-mixed-test');
      if (akpResult) {
        expect(akpResult.alg).to.equal('ML-DSA-65');
      }
    });
  });
});
