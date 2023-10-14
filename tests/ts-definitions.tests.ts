// import * as jwksRsaType from '../index';
import { expect } from 'chai';
import expressjwt6 from 'express-jwt-v6';
import { expressjwt as expressjwt7, GetVerificationKey } from 'express-jwt-v7';

import { jwksEndpoint } from '../tests/mocks/jwks.js';
import { publicKey } from '../tests/mocks/keys.js';
import { x5cSingle } from '../tests/keys.js';
import { expressJwtSecret, hapiJwt2KeyAsync, JwksClient } from 'src/index.js';

describe('typescript definition', () => {
  const jwksHost = 'http://localhost';

  describe('hapiJwt2KeyAsync', () => {
    it('should return a secret provider function', async () => {
      jwksEndpoint(jwksHost, [{ pub: publicKey, kid: '123' }]);

      const secretProvider = hapiJwt2KeyAsync({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });
      const { key } = await secretProvider({
        header: {
          alg: 'RS256',
          kid: '123'
        }
      });
      expect(key).to.contain('-----BEGIN PUBLIC KEY');
    });
  });

  it('getKeysInterceptor', async () => {
    const client = new JwksClient({
      jwksUri: `${jwksHost}/.well-known/jwks.json`,
      getKeysInterceptor: () => Promise.resolve(x5cSingle.keys)
    });

    const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
    expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
  });

  it('Types-Only Validation with express-jwt', () => {
    expressjwt6({
      algorithms: ['RS256'],
      secret: expressJwtSecret({
        cache: true,
        jwksUri: `https://my-authz-server/.well-known/jwks.json`
      })
    });

    expressjwt7({
      algorithms: ['RS256'],
      secret: expressJwtSecret({
        cache: true,
        jwksUri: `https://my-authz-server/.well-known/jwks.json`
      }) as GetVerificationKey
    });
  });
});
