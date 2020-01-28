import nock from 'nock';
import { expect } from 'chai';
const mock = require('mock-fs');

import { x5cSingle } from './keys';
import { JwksClient } from '../src/JwksClient';

describe('JwksClient (cache)', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    mock.restore();
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
          
        })
      })
    })
    describe('with local file cache', () => {

      it('should cache requests', (done) => {
        mock({
          '/tmp/jwks-cache': JSON.stringify({stuff: "other stuff"})
        }, {});
        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .reply(200, x5cSingle);

        const client = new JwksClient({
          cache: true,
          useTmpFileCache: true,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
          expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
          nock.cleanAll();

          client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
            expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
            done();
          });
        });
      });

      it('should cache requests per kid', (done) => {
        mock({
          '/tmp/jwks-cache': JSON.stringify({stuff: "other stuff"})
        }, {});
        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .reply(200, x5cSingle);

        const client = new JwksClient({
          cache: true,
          useTmpFileCache: true,
          jwksUri: `${jwksHost}/.well-known/jwks.json`
        });

        client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
          expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
          nock.cleanAll();

          // This second call should fail because we "stopped the server" and this key was not cached.
          client.getSigningKey('12345', (err) => {
            expect(err).not.to.be.null;
            expect(err.code).to.equal('ENOTFOUND');
            done();
          });
        });
      });

      it('should fetch the key from the cache', (done) => {
        client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA', (err, key) => {
          expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
          done();
        });
      });
    });



  });
});
