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
    const jwks = [es256k, rsa];
    const keys = await retrieveSigningKeys(jwks);

    // Unsupported (ES256K) key should be ignored
    expect(keys.find(k => k.kid === 'es256k-test')).to.be.undefined;

    // Supported RSA key should be resolved.
    expect(keys).to.have.lengthOf(1);
    expect(keys[0].kid).to.equal(rsa.kid);
  });
});
