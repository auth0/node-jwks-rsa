import nock from 'nock';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

const { expect } = use(chaiAsPromised);

import { x5cSingle } from './keys.js';
import { JwksClient } from '../src/JwksClient.js';

describe('JwksClient (cache)', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('#getSigningKey', () => {
    describe('should cache requests per kid', () => {
      /** @type {JwksClient} */
      let client;
      // @ts-ignore
      let scope;

      beforeEach(async () => {
        scope = nock(jwksHost).get('/.well-known/jwks.json').twice().reply(200, x5cSingle);

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
        await expect(client.getSigningKey('12345')).to.eventually.be.rejectedWith(
          "Unable to find a signing key that matches '12345'"
        );
        // @ts-ignore
        expect(scope.isDone()).ok;
      });

      it('should fetch the key from the cache', async () => {
        const key = await client.getSigningKey('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
        expect(key.kid).to.equal('NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA');
        // @ts-ignore
        expect(scope.isDone()).not.ok;
      });
    });
  });
});
