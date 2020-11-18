import nock from 'nock';
import * as jwksRsaType from '../index';
import {expect} from 'chai';
const jwksRsa: typeof jwksRsaType = require('../src');

describe('typescript definition', () => {
  const jwksHost = 'http://my-authz-server';

  const givenPublicCertOnAuthzServer = (kid: string, cert: string) => {
    nock(jwksHost)
    .get('/.well-known/jwks.json')
    .reply(200, {
      keys: [
        {
          alg: 'RS256',
          kty: 'RSA',
          use: 'sig',
          x5c: [cert],
          kid
        }
      ]
    });
  }

  describe('hapiJwt2KeyAsync', () => {
    it('should return a secret provider function', async () => {
      givenPublicCertOnAuthzServer('someKeyId', 'pk1');

      const secretProvider = jwksRsa.hapiJwt2KeyAsync({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });
      const { key } = await secretProvider({
        header: {
          'alg': 'RS256',
          'kid': 'someKeyId'
        }
      });

      expect(key).to.contain('pk1');
    });
  });
});
