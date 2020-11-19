import nock from 'nock';
import { expect } from 'chai';

import { x5cSingle, x5cMultiple } from './keys';
import { JwksClient } from '../src/JwksClient';

import CustomCache from './mocks/CustomCache';

describe('JwksClient (cache)', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('#getSigningKey', () => {
    describe('should cache requests per kid', () => {
      let client;
      
      before((done) => {
        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .reply(200, x5cSingle);

        client = new JwksClient({
          cache: true,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        // Cache the Key
        client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
          expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');

          // Stop the JWKS server
          nock.cleanAll();
          done();
        });
      });

      it('should ignore the cache when the KID isnt cached and make a requst', (done) => {
        client.getSigningKey('12345', (err) => {
          expect(err).not.to.be.null;
          expect(err.code).to.equal('ENOTFOUND');
          done();
        });
      });

      it('should fetch the key from the cache', (done) => {
        client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
          expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
          done();
        });
      });
    });
  
    describe('when using customCache', () => {
      let client;
      const keyOne = x5cMultiple.keys[0];
      const keyTwo = x5cMultiple.keys[1];

      before((done) => {
        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .reply(200, { keys: [ keyOne ] });

        client = new JwksClient({
          jwksUri: `${jwksHost}/.well-known/jwks.json`,
          cache: true,
          customCache: new CustomCache([ keyTwo ])
        });

        // Cache the Key
        client.getSigningKey(keyOne.kid, (err, key) => {
          expect(key.kid).to.equal(keyOne.kid);

          // Stop the JWKS server
          nock.cleanAll();
          done();
        });
      });

      it('should fetch the key from the customCache', (done) => {
        client.getSigningKey(keyOne.kid, (err, key) => {
          expect(key.kid).to.equal(keyOne.kid);
          done();
        });
      });

      it('should fetch key from customized cache implementation', (done) => {
        client.getSigningKey(keyTwo.kid, (err, key) => {
          expect(key.kid).to.equal(keyTwo.kid);
          done();
        });
      });
    });
  });
});
