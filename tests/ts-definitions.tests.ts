import * as jwksRsaType from '../index';
import {expect} from 'chai';
const { jwksEndpoint } = require('../tests/mocks/jwks');
const { publicKey } = require('../tests/mocks/keys');
const jwksRsa: typeof jwksRsaType = require('../src');

describe('typescript definition', () => {
  const jwksHost = 'http://my-authz-server';

  describe('hapiJwt2KeyAsync', () => {
    it('should return a secret provider function', async () => {
      jwksEndpoint(jwksHost,  [ { pub: publicKey, kid: '123' } ])

      const secretProvider = jwksRsa.hapiJwt2KeyAsync({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });
      const { key } = await secretProvider({
        header: {
          'alg': 'RS256',
          'kid': '123'
        }
      });
      expect(key).to.contain('-----BEGIN PUBLIC KEY');
    });
  });

  describe('getKeysInterceptor', async () => {
    const keySetResponse = {
      keys: [
        {
          alg: 'RS256',
          kty: 'RSA',
          use: 'sig',
          kid: 'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA'
        }
      ]
    };

    const client = new jwksRsa.JwksClient({
      jwksUri: `${jwksHost}/.well-known/jwks.json`,
      getKeysInterceptor: () => Promise.resolve(keySetResponse.keys)
    });

    const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
    expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
  });
});
