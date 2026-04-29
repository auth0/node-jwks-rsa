const nock = require('nock');
const { expect } = require('chai').use(require('chai-as-promised'));

const { x5cSingle } = require('./keys');
const { JwksClient } = require('../src/JwksClient');

describe('JwksClient (cache)', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('#getSigningKey', () => {
    describe('should cache requests per kid', () => {
      let client;
      let scope;

      beforeEach(async () => {
        scope = nock(jwksHost)
          .get('/.well-known/jwks.json')
          .twice()
          .reply(200, x5cSingle);

        client = new JwksClient({
          cache: true,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        // Cache the Key
        const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
        expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
      });

      afterEach(() => {
        // Stop the JWKS server
        nock.cleanAll();
      });

      it('should ignore the cache when the KID isnt cached and make a request', async () => {
        await expect(client.getSigningKey('12345')).to.eventually.be.rejectedWith('Unable to find a signing key that matches \'12345\'');
        expect(scope.isDone()).ok;
      });

      it('should fetch the key from the cache', async () => {
        const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
        expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
        expect(scope.isDone()).not.ok;
      });
    });
    describe('cacheMaxAgeFallback', () => {
      const kid = 'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA';
      const cacheMaxAge = 100;
      const cacheMaxAgeFallback = 500;

      it('should serve stale key when AS is down and within fallback window', async () => {
        const scope = nock(jwksHost)
          .get('/.well-known/jwks.json')
          .once()
          .reply(200, x5cSingle);

        const client = new JwksClient({
          cache: true,
          cacheMaxAge,
          cacheMaxAgeFallback,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        // First request - caches the key
        const key1 = await client.getSigningKey(kid);
        expect(key1.kid).to.equal(kid);

        // AS goes down
        nock(jwksHost).get('/.well-known/jwks.json').reply(500, 'Service Unavailable');

        // Wait for cacheMaxAge to expire
        await new Promise(resolve => setTimeout(resolve, cacheMaxAge + 10));

        // Should serve stale key instead of throwing
        const key2 = await client.getSigningKey(kid);
        expect(key2.kid).to.equal(kid);
        expect(scope.isDone()).ok;

        nock.cleanAll();
      });

      it('should throw when AS is down and fallback window has also expired', async () => {
        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .once()
          .reply(200, x5cSingle);

        const client = new JwksClient({
          cache: true,
          cacheMaxAge,
          cacheMaxAgeFallback: 50,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        // First request - caches the key
        await client.getSigningKey(kid);

        // AS goes down
        nock(jwksHost).get('/.well-known/jwks.json').reply(500, 'Service Unavailable');

        // Wait for both cacheMaxAge + cacheMaxAgeFallback to expire
        await new Promise(resolve => setTimeout(resolve, cacheMaxAge + 50 + 20));

        await expect(client.getSigningKey(kid)).to.eventually.be.rejected;

        nock.cleanAll();
      });

      it('should not serve stale key when cacheMaxAgeFallback is not set', async () => {
        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .once()
          .reply(200, x5cSingle);

        const client = new JwksClient({
          cache: true,
          cacheMaxAge,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        await client.getSigningKey(kid);

        nock(jwksHost).get('/.well-known/jwks.json').reply(500, 'Service Unavailable');

        await new Promise(resolve => setTimeout(resolve, cacheMaxAge + 10));

        await expect(client.getSigningKey(kid)).to.eventually.be.rejected;

        nock.cleanAll();
      });
    });

    describe('should respect cacheMaxAge', () => {
      const kid = 'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA';
      const cacheMaxAge = 100;

      it('should make a new request after cache expires', async () => {
        const scope = nock(jwksHost)
          .get('/.well-known/jwks.json')
          .twice()
          .reply(200, x5cSingle);

        const client = new JwksClient({
          cache: true,
          cacheMaxAge: cacheMaxAge,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        // First request - should cache the key
        const key1 = await client.getSigningKey(kid);
        expect(key1.kid).to.equal(kid);
        expect(scope.isDone()).not.ok; // Only one request should have been made

        // Second request immediately - should use cache
        const key2 = await client.getSigningKey(kid);
        expect(key2.kid).to.equal(kid);
        expect(scope.isDone()).not.ok; // Still no second request

        // Wait for cache to expire
        await new Promise(resolve => setTimeout(resolve, cacheMaxAge + 10));

        // Third request after expiration - should make a new request
        const key3 = await client.getSigningKey(kid);
        expect(key3.kid).to.equal(kid);
        expect(scope.isDone()).ok; // Now both requests should have been made

        nock.cleanAll();
      });
    });
  });
});
