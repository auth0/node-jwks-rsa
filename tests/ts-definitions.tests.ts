import * as jwksRsaType from '../index';
import {expect} from 'chai';
import expressjwt6 from "express-jwt";
import { expressjwt as expressjwt7, GetVerificationKey } from "express-jwt-v7";
const { jwksEndpoint } = require('../tests/mocks/jwks');
const { publicKey } = require('../tests/mocks/keys');
const { x5cSingle } = require('../tests/keys.js');
const jwksRsa: typeof jwksRsaType = require('../src');

describe('typescript definition', () => {
  const jwksHost = 'http://localhost';

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

  it('getKeysInterceptor', async () => {
    const client = new jwksRsa.JwksClient({
      jwksUri: `${jwksHost}/.well-known/jwks.json`,
      getKeysInterceptor: () => Promise.resolve(x5cSingle.keys)
    });

    const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
    expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
  });

  it('Types-Only Validation with express-jwt', () => {
    expressjwt6({
      algorithms: ["RS256"],
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        jwksUri: `https://my-authz-server/.well-known/jwks.json`
      })
    });

    expressjwt7({
      algorithms: ['RS256'],
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        jwksUri: `https://my-authz-server/.well-known/jwks.json`
      }) as GetVerificationKey
    });
  })
});
