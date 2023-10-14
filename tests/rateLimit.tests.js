import nock from 'nock';
import { expect } from 'chai';

import { x5cSingle } from './keys.js';
import { JwksClient } from '../src/JwksClient.js';

describe('JwksClient (cache)', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('#getSigningKeys', () => {
    it('should prevent too many requests', async () => {
      const client = new JwksClient({
        cache: false,
        rateLimit: true,
        jwksRequestsPerMinute: 2,
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      nock(jwksHost).get('/.well-known/jwks.json').reply(200, x5cSingle);

      const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
      expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

      nock(jwksHost).get('/.well-known/jwks.json').reply(200, x5cSingle);

      const key2 = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
      expect(key2.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

      try {
        await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
        throw new Error('should have thrown error');
      } catch (err) {
        expect(err).not.to.be.null;
        expect(err.name).to.equal('JwksRateLimitError');
        expect(err.message).to.equal('Too many requests to the JWKS endpoint');
      }
    });

    it('should not prevent cached requests', async () => {
      const client = new JwksClient({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 2,
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      // First call.
      nock(jwksHost).get('/.well-known/jwks.json').reply(200, x5cSingle);
      const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
      expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

      // Second call (cached).
      nock(jwksHost).get('/.well-known/jwks.json').reply(200, x5cSingle);
      const key2 = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
      expect(key2.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

      // Third call (cached).
      nock(jwksHost).get('/.well-known/jwks.json').reply(200, x5cSingle);
      const key3 = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
      expect(key3.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

      // Fourth call.
      try {
        await client.getSigningKey('abc');
        throw new Error('should have thrown error');
      } catch (err) {
        expect(err).not.to.be.null;
        expect(err.name).to.equal('SigningKeyNotFoundError');
        expect(err.message).to.equal("Unable to find a signing key that matches 'abc'");
      }

      // Fifth call.
      try {
        await client.getSigningKey('def');
        throw new Error('should have thrown error');
      } catch (err) {
        expect(err).not.to.be.null;
        expect(err.name).to.equal('JwksRateLimitError');
        expect(err.message).to.equal('Too many requests to the JWKS endpoint');
      }
    });
  });
});
