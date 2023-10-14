import nock from 'nock';
import { expect } from 'chai';

import { x5cSingle, x5cMultiple } from './keys.js';
import { JwksClient } from '../src/JwksClient.js';

describe('JwksClient (interceptor)', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('#getSigningKeys', () => {
    it('should prefer key from interceptor', async () => {
      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`,
        getKeysInterceptor: () => Promise.resolve(x5cSingle.keys)
      });

      nock(jwksHost).get('/.well-known/jwks.json').replyWithError('Call to jwksUri not expected');

      const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
      expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
    });

    it('should fallback to fetch from jwksUri', async () => {
      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`,
        getKeysInterceptor: () => Promise.resolve([])
      });

      nock(jwksHost).get('/.well-known/jwks.json').reply(200, x5cMultiple);

      const key = await client.getSigningKey('RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg');
      expect(key.kid).to.equal('RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg');
    });
  });
});
