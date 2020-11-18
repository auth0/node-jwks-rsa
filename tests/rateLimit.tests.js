import nock from 'nock';
import { expect } from 'chai';

import { x5cSingle } from './keys';
import { JwksClient } from '../src/JwksClient';

describe('JwksClient (cache)', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('#getSigningKeys', () => {
    it('should prevent too many requests', (done) => {
      const client = new JwksClient({
        cache: false,
        rateLimit: true,
        jwksRequestsPerMinute: 2,
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, x5cSingle);

      client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
        expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .reply(200, x5cSingle);

        client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
          expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

          client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err) => {
            expect(err).not.to.be.null;
            expect(err.name).to.equal('JwksRateLimitError');
            expect(err.message).to.equal('Too many requests to the JWKS endpoint');
            done();
          });
        });
      });
    });

    it('should not prevent cached requests', (done) => {
      const client = new JwksClient({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 2,
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, x5cSingle);

      // First call.
      client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
        expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

        // Second call (cached).
        client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
          expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

          // Third call (cached).
          client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
            expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

            nock(jwksHost)
              .get('/.well-known/jwks.json')
              .reply(200, x5cSingle);

            // Fourth call.
            client.getSigningKey('abc', (err) => {
              expect(err).not.to.be.null;
              expect(err.name).to.equal('SigningKeyNotFoundError');
              expect(err.message).to.equal('Unable to find a signing key that matches \'abc\'');

              // Fifth call.
              client.getSigningKey('def', (err) => {
                expect(err).not.to.be.null;
                expect(err.name).to.equal('JwksRateLimitError');
                expect(err.message).to.equal('Too many requests to the JWKS endpoint');
                done();
              });
            });
          });
        });
      });
    });
  });
});
