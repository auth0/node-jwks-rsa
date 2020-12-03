import http from 'http';
import Proxy from 'proxy';
import nock from 'nock';
import { expect } from 'chai';

import { x5cMultiple } from './keys';
import { JwksClient } from '../src/JwksClient';
import jwksObject from './mocks/jwks.json';

describe('JwksClient', () => {
  const jwksHost = 'http://my-authz-server';

  beforeEach(() => {
    nock.cleanAll();
  });

  describe('#getKeys', () => {
    it('should handle errors', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(500, 'Unknown Server Error');

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getKeys(err => {
        expect(err).not.to.be.null;
        expect(err.message).to.equal('Unknown Server Error');
        done();
      });
    });

    it('should return keys', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, {
          keys: [
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [ 'pk1' ],
              kid: 'ABC'
            },
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [],
              kid: '123'
            }
          ]
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getKeys((err, keys) => {
        expect(err).to.be.null;
        expect(keys).not.to.be.null;
        expect(keys.length).to.equal(2);
        expect(keys[1].kid).to.equal('123');
        done();
      });
    });

    it('should return keys that are directly provided', done => {
      const client = new JwksClient({ jwksObject });

      client.getKeys((err, respKeys) => {
        expect(err).to.be.null;
        expect(respKeys).not.to.be.null;
        expect(respKeys.length).to.equal(jwksObject.keys.length);
        expect(respKeys[1].kid).to.equal(jwksObject.keys[1].kid);
        done();
      });
    });

    it('should set request agentOptions when provided', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(function() {
          expect(this.req.agentOptions).not.to.be.null;
          expect(this.req.agentOptions['ca']).to.be.equal('loadCA()');
          return 200;
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`,
        requestAgentOptions: {
          ca: 'loadCA()'
        }
      });

      client.getKeys(() => {
        done();
      });
    });

    it('should not set request agentOptions by default', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(function() {
          expect(this.req).to.not.have.property('agentOptions');
          return 200;
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getKeys(() => {
        done();
      });
    });

    it('should send extra header', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(function() {
          expect(this.req.headers).not.to.be.null;
          expect(this.req.headers['user-agent']).to.be.equal('My-bot');
          expect(Object.keys(this.req.headers).length).to.be.equal(3);
          return (
            200,
            {
              keys: [
                {
                  alg: 'RS256',
                  kty: 'RSA',
                  use: 'sig',
                  x5c: [ 'pk1' ],
                  kid: 'ABC'
                },
                {
                  alg: 'RS256',
                  kty: 'RSA',
                  use: 'sig',
                  x5c: [],
                  kid: '123'
                }
              ]
            }
          );
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`,
        requestHeaders: {
          'User-Agent': 'My-bot'
        }
      });

      client.getKeys(() => {
        done();
      });
    });

    it('should not send the extra headers when not provided', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(function() {
          expect(this.req.headers).not.to.be.null;
          expect(this.req.headers['accept']).not.to.be.undefined;
          expect(this.req.headers['host']).not.to.be.undefined;
          expect(Object.keys(this.req.headers).length).to.be.equal(2);
          return (
            200,
            {
              keys: [
                {
                  alg: 'RS256',
                  kty: 'RSA',
                  use: 'sig',
                  x5c: [ 'pk1' ],
                  kid: 'ABC'
                },
                {
                  alg: 'RS256',
                  kty: 'RSA',
                  use: 'sig',
                  x5c: [],
                  kid: '123'
                }
              ]
            }
          );
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getKeys(() => {
        done();
      });
    });

    describe('when using a proxy', () => {
      let server;
      let proxy;
      let proxyPort;
      let serverPort;
      let serverAddress;
      let proxyAddress;

      before((done) => {
        server = http.createServer();
        server.listen(() => {
          serverPort = server.address().port;
          serverAddress = `http://localhost:${serverPort}`;
          done();
        });
      });

      before((done) => {
        proxy = Proxy();
        proxy.listen(() => {
          proxyPort = proxy.address().port;
          proxyAddress = `http://localhost:${proxyPort}`;
          done();
        });
      });

      after((done) => {
        server.once('close', () => done());
        server.close();
      });

      after((done) => {
        proxy.once('close', () => done());
        proxy.close();
      });

      it('should properly handle a proxied request', (done) => {
        const expectedKeys = {
          keys: [
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [ 'pk1' ],
              kid: 'ABC'
            },
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [],
              kid: '123'
            }
          ]
        };
        server.once('request', (req, res) => res.end(JSON.stringify(expectedKeys)));

        const client = new JwksClient({ jwksUri: serverAddress, proxy: proxyAddress });
        client.getKeys((err, keys) => {
          expect(keys).to.eql(expectedKeys.keys);
          done();
        });
      });

      it('should fail when proxy address is not reachable', (done) => {
        proxyAddress = 'http://wrongAddress';
        server.once('request', (req, res) => res.end(JSON.stringify(expectedKeys)));

        const client = new JwksClient({ jwksUri: serverAddress, proxy: proxyAddress });
        client.getKeys((err) => {
          expect(err.code).to.eql('ENOTFOUND');
          done();
        });
      });
    });
  });
  
  describe('#getKeysAsync', () => {
    it('should handle errors when async', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(500, 'Unknown Server Error');

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getKeysAsync()
        .catch(err => {
          expect(err).not.to.be.null;
          expect(err.message).to.equal('Unknown Server Error');
          done();
        });
    });

    it('should return keys when async', function(done) {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, {
          keys: [
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [ 'pk1' ],
              kid: 'ABC'
            },
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [],
              kid: '123'
            }
          ]
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getKeysAsync()
        .then(keys => {
          expect(keys).not.to.be.null;
          expect(keys.length).to.equal(2);
          expect(keys[1].kid).to.equal('123');
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  describe('#getSigningKeys', () => {
    it('should handle errors', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(500, 'Unknown Server Error');

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeys(err => {
        expect(err).not.to.be.null;
        expect(err.message).to.equal('Unknown Server Error');
        done();
      });
    });

    it('should return signing keys (with x5c and mod/exp)', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, {
          keys: [
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [
                'MIIDDTCCAfWgAwIBAgIJAJVkuSv2H8mDMA0GCSqGSIb3DQEBBQUAMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTAeFw0xNDA1MTQyMTIyMjZaFw0yODAxMjEyMTIyMjZaMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL6jWASkHhXz5Ug6t5BsYBrXDIgrWu05f3oq2fE+5J5REKJiY0Ddc+Kda34ZwOptnUoef3JwKPDAckTJQDugweNNZPwOmFMRKj4xqEpxEkIX8C+zHs41Q6x54ZZy0xU+WvTGcdjzyZTZ/h0iOYisswFQT/s6750tZG0BOBtZ5qS/80tmWH7xFitgewdWteJaASE/eO1qMtdNsp9fxOtN5U/pZDUyFm3YRfOcODzVqp3wOz+dcKb7cdZN11EYGZOkjEekpcedzHCo9H4aOmdKCpytqL/9FXoihcBMg39s1OW3cfwfgf5/kvOJdcqR4PoATQTfsDVoeMWVB4XLGR6SC5kCAwEAAaNQME4wHQYDVR0OBBYEFHDYn9BQdup1CoeoFi0Rmf5xn/W9MB8GA1UdIwQYMBaAFHDYn9BQdup1CoeoFi0Rmf5xn/W9MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAGLpQZdd2ICVnGjc6CYfT3VNoujKYWk7E0shGaCXFXptrZ8yaryfo6WAizTfgOpQNJH+Jz+QsCjvkRt6PBSYX/hb5OUDU2zNJN48/VOw57nzWdjI70H2Ar4oJLck36xkIRs/+QX+mSNCjZboRwh0LxanXeALHSbCgJkbzWbjVnfJEQUP9P/7NGf0MkO5I95C/Pz9g91y8gU+R3imGppLy9Zx+OwADFwKAEJak4JrNgcjHBQenakAXnXP6HG4hHH4MzO8LnLiKv8ZkKVL67da/80PcpO0miMNPaqBBMd2Cy6GzQYE0ag6k0nk+DMIFn7K+o21gjUuOEJqIbAvhbf2KcM='
              ],
              n:
                'vqNYBKQeFfPlSDq3kGxgGtcMiCta7Tl_eirZ8T7knlEQomJjQN1z4p1rfhnA6m2dSh5_cnAo8MByRMlAO6DB401k_A6YUxEqPjGoSnESQhfwL7MezjVDrHnhlnLTFT5a9MZx2PPJlNn-HSI5iKyzAVBP-zrvnS1kbQE4G1nmpL_zS2ZYfvEWK2B7B1a14loBIT947Woy102yn1_E603lT-lkNTIWbdhF85w4PNWqnfA7P51wpvtx1k3XURgZk6SMR6Slx53McKj0fho6Z0oKnK2ov_0VeiKFwEyDf2zU5bdx_B-B_n-S84l1ypHg-gBNBN-wNWh4xZUHhcsZHpILmQ',
              e: 'AQAB',
              kid: 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg',
              x5t: 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg'
            },
            {
              kid: 'IdTokenSigningKeyContainer',
              use: 'sig',
              kty: 'RSA',
              e: 'AQAB',
              n:
                'tLDZVZ2Eq_DFwNp24yeSq_Ha0MYbYOJs_WXIgVxQGabu5cZ9561OUtYWdB6xXXZLaZxFG02P5U2rC_CT1r0lPfC_KHYrviJ5Y_Ekif7iFV_1omLAiRksQziwA1i-hND32N5kxwEGNmZViVjWMBZ43wbIdWss4IMhrJy1WNQ07Fqp1Ee6o7QM1hTBve7bbkJkUAfjtC7mwIWqZdWoYIWBTZRXvhMgs_Aeb_pnDekosqDoWQ5aMklk3NvaaBBESqlRAJZUUf5WDFoJh7yRELOFF4lWJxtArTEiQPWVTX6PCs0klVPU6SRQqrtc4kKLCp1AC5EJqPYRGiEJpSz2nUhmAQ'
            }
          ]
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeys((err, keys) => {
        expect(err).to.be.null;
        expect(keys).not.to.be.null;
        expect(keys.length).to.equal(2);
        const pubkey0 = keys[0].publicKey || keys[0].rsaPublicKey;
        expect(pubkey0).not.to.be.null;
        expect(keys[0].getPublicKey()).to.equal(keys[0].publicKey);
        expect(keys[1].kid).to.equal('IdTokenSigningKeyContainer');
        expect(keys[0].kid).to.equal('RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg');
        const pubkey1 = keys[1].publicKey || keys[1].rsaPublicKey;
        expect(pubkey1).not.to.be.null;
        expect(keys[1].getPublicKey()).to.equal(keys[1].rsaPublicKey);
        done();
      });
    });

    it('should return signing keys (with x5c)', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, {
          keys: [
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              x5c: [
                'MIIDDTCCAfWgAwIBAgIJAJVkuSv2H8mDMA0GCSqGSIb3DQEBBQUAMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTAeFw0xNDA1MTQyMTIyMjZaFw0yODAxMjEyMTIyMjZaMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL6jWASkHhXz5Ug6t5BsYBrXDIgrWu05f3oq2fE+5J5REKJiY0Ddc+Kda34ZwOptnUoef3JwKPDAckTJQDugweNNZPwOmFMRKj4xqEpxEkIX8C+zHs41Q6x54ZZy0xU+WvTGcdjzyZTZ/h0iOYisswFQT/s6750tZG0BOBtZ5qS/80tmWH7xFitgewdWteJaASE/eO1qMtdNsp9fxOtN5U/pZDUyFm3YRfOcODzVqp3wOz+dcKb7cdZN11EYGZOkjEekpcedzHCo9H4aOmdKCpytqL/9FXoihcBMg39s1OW3cfwfgf5/kvOJdcqR4PoATQTfsDVoeMWVB4XLGR6SC5kCAwEAAaNQME4wHQYDVR0OBBYEFHDYn9BQdup1CoeoFi0Rmf5xn/W9MB8GA1UdIwQYMBaAFHDYn9BQdup1CoeoFi0Rmf5xn/W9MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAGLpQZdd2ICVnGjc6CYfT3VNoujKYWk7E0shGaCXFXptrZ8yaryfo6WAizTfgOpQNJH+Jz+QsCjvkRt6PBSYX/hb5OUDU2zNJN48/VOw57nzWdjI70H2Ar4oJLck36xkIRs/+QX+mSNCjZboRwh0LxanXeALHSbCgJkbzWbjVnfJEQUP9P/7NGf0MkO5I95C/Pz9g91y8gU+R3imGppLy9Zx+OwADFwKAEJak4JrNgcjHBQenakAXnXP6HG4hHH4MzO8LnLiKv8ZkKVL67da/80PcpO0miMNPaqBBMd2Cy6GzQYE0ag6k0nk+DMIFn7K+o21gjUuOEJqIbAvhbf2KcM='
              ],
              n:
                'vqNYBKQeFfPlSDq3kGxgGtcMiCta7Tl_eirZ8T7knlEQomJjQN1z4p1rfhnA6m2dSh5_cnAo8MByRMlAO6DB401k_A6YUxEqPjGoSnESQhfwL7MezjVDrHnhlnLTFT5a9MZx2PPJlNn-HSI5iKyzAVBP-zrvnS1kbQE4G1nmpL_zS2ZYfvEWK2B7B1a14loBIT947Woy102yn1_E603lT-lkNTIWbdhF85w4PNWqnfA7P51wpvtx1k3XURgZk6SMR6Slx53McKj0fho6Z0oKnK2ov_0VeiKFwEyDf2zU5bdx_B-B_n-S84l1ypHg-gBNBN-wNWh4xZUHhcsZHpILmQ',
              e: 'AQAB',
              kid: 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg',
              x5t: 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg'
            },
            {
              alg: 'RS256',
              kty: 'RSA',
              use: 'sig',
              nbf: 123,
              x5c: [
                'MIIDGzCCAgOgAwIBAgIJAPQM5+PwmOcPMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMMGXNhbmRyaW5vLWRldi5ldS5hdXRoMC5jb20wHhcNMTUwMzMxMDkwNTQ3WhcNMjgxMjA3MDkwNTQ3WjAkMSIwIAYDVQQDDBlzYW5kcmluby1kZXYuZXUuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv/SECtT7H4rxKtX2HpGhSyeYTe3Vet8YQpjBAr+1TnQ1fcYfvfmnVRHvhmTwABktD1erF1lxFsrRw92yBDOHlL7lj1n2fcfLftSoStgvRHVg52kR+CkBVQ6/mF1lYkefIjik6YRMf55Eu4FqDyVG2dgd5EA8kNO4J8OPc7vAtZyXrRYOZjVXbEgyjje/V+OpMQxAHP2Er11TLuzJjioP0ICVqhAZdq2sLk7agoxn64md6fqOk4N+7lJkU4+412VD0qYwKxD7nGsEclYawKoZD9/xhCk2qfQ/HptIumrdQ5ox3Sq5t2a7VKa41dBUQ1MQtXG2iY7S9RlfcMIyQwGhOQIDAQABo1AwTjAdBgNVHQ4EFgQUHpS1fvO/54G2c1VpEDNUZRSl44gwHwYDVR0jBBgwFoAUHpS1fvO/54G2c1VpEDNUZRSl44gwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAtm9I0nr6eXF5aq4yllfiqZcQ6mKrJLH9Rm4Jv+olniNynTcnpwprRVLToIawc8MmzIGZTtCn7u+dSxWf1UNE+SH7XgEnGtO74239vleEx1+Tf5viIdsnCxgvFiPdOqRlc9KcFSWd6a7RzcglnyU7GEx0K5GLv1wPA6qEM+3uwNwjAyVSu5dFw8kCfaSvlk5rXKRUzSoW9NVomw6+tADR8vMZS+4KThZ+4GH0rMN4KjIaRFxW8OMVYOn12uq33fLCd6MuPHW/rklxLbQBoHIU/ClNhbD0t6f00w9lHhPy4IP73rv7Oow0Ny6i70Iq0ijqj+kAtnrphlOvLFxqn6nCvQ=='
              ],
              n:
                'v_SECtT7H4rxKtX2HpGhSyeYTe3Vet8YQpjBAr-1TnQ1fcYfvfmnVRHvhmTwABktD1erF1lxFsrRw92yBDOHlL7lj1n2fcfLftSoStgvRHVg52kR-CkBVQ6_mF1lYkefIjik6YRMf55Eu4FqDyVG2dgd5EA8kNO4J8OPc7vAtZyXrRYOZjVXbEgyjje_V-OpMQxAHP2Er11TLuzJjioP0ICVqhAZdq2sLk7agoxn64md6fqOk4N-7lJkU4-412VD0qYwKxD7nGsEclYawKoZD9_xhCk2qfQ_HptIumrdQ5ox3Sq5t2a7VKa41dBUQ1MQtXG2iY7S9RlfcMIyQwGhOQ',
              e: 'AQAB',
              kid: 'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA',
              x5t: 'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA'
            }
          ]
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeys((err, keys) => {
        expect(err).to.be.null;
        expect(keys).not.to.be.null;
        expect(keys.length).to.equal(2);
        expect(keys[0].publicKey).not.to.be.null;
        expect(keys[0].getPublicKey()).to.equal(keys[0].publicKey);
        expect(keys[0].kid).to.equal(
          'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg'
        );
        expect(keys[1].kid).to.equal(
          'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA'
        );
        expect(keys[1].publicKey).not.to.be.null;
        expect(keys[1].getPublicKey()).to.equal(keys[1].publicKey);
        expect(keys[1].nbf).to.equal(123);
        done();
      });
    });

    it('should return signing keys (mod/exp)', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, {
          keys: [
            {
              kid: 'IdTokenSigningKeyContainer',
              use: 'sig',
              kty: 'RSA',
              e: 'AQAB',
              n:
                'tLDZVZ2Eq_DFwNp24yeSq_Ha0MYbYOJs_WXIgVxQGabu5cZ9561OUtYWdB6xXXZLaZxFG02P5U2rC_CT1r0lPfC_KHYrviJ5Y_Ekif7iFV_1omLAiRksQziwA1i-hND32N5kxwEGNmZViVjWMBZ43wbIdWss4IMhrJy1WNQ07Fqp1Ee6o7QM1hTBve7bbkJkUAfjtC7mwIWqZdWoYIWBTZRXvhMgs_Aeb_pnDekosqDoWQ5aMklk3NvaaBBESqlRAJZUUf5WDFoJh7yRELOFF4lWJxtArTEiQPWVTX6PCs0klVPU6SRQqrtc4kKLCp1AC5EJqPYRGiEJpSz2nUhmAQ'
            },
            {
              kid: 'IdTokenSigningKeyContainer.v2',
              nbf: 1459289287,
              use: 'sig',
              kty: 'RSA',
              e: 'AQAB',
              n:
                's4W7xjkQZP3OwG7PfRgcYKn8eRYXHiz1iK503fS-K2FZo-Ublwwa2xFZWpsUU_jtoVCwIkaqZuo6xoKtlMYXXvfVHGuKBHEBVn8b8x_57BQWz1d0KdrNXxuMvtFe6RzMqiMqzqZrzae4UqVCkYqcR9gQx66Ehq7hPmCxJCkg7ajo7fu6E7dPd34KH2HSYRsaaEA_BcKTeb9H1XE_qEKjog68wUU9Ekfl3FBIRN-1Ah_BoktGFoXyi_jt0-L0-gKcL1BLmUlGzMusvRbjI_0-qj-mc0utGdRjY-xIN2yBj8vl4DODO-wMwfp-cqZbCd9TENyHaTb8iA27s-73L3ExOQ'
            },
            {
              kid: 'IdTokenSigningKeyContainer.v3',
              nbf: 1459289287,
              kty: 'RSA',
              e: 'AQAB',
              n:
                's4W7xjkQZP3OwG7PfRgcYKn8eRYXHiz1iK503fS-K2FZo-Ublwwa2xFZWpsUU_jtoVCwIkaqZuo6xoKtlMYXXvfVHGuKBHEBVn8b8x_57BQWz1d0KdrNXxuMvtFe6RzMqiMqzqZrzae4UqVCkYqcR9gQx66Ehq7hPmCxJCkg7ajo7fu6E7dPd34KH2HSYRsaaEA_BcKTeb9H1XE_qEKjog68wUU9Ekfl3FBIRN-1Ah_BoktGFoXyi_jt0-L0-gKcL1BLmUlGzMusvRbjI_0-qj-mc0utGdRjY-xIN2yBj8vl4DODO-wMwfp-cqZbCd9TENyHaTb8iA27s-73L3ExOQ'
            },
            {
              kid: 'IdTokenSigningKeyContainer.v4',
              nbf: 1459289287,
              use: 'enc',
              kty: 'RSA',
              e: 'AQAB',
              n:
                's4W7xjkQZP3OwG7PfRgcYKn8eRYXHiz1iK503fS-K2FZo-Ublwwa2xFZWpsUU_jtoVCwIkaqZuo6xoKtlMYXXvfVHGuKBHEBVn8b8x_57BQWz1d0KdrNXxuMvtFe6RzMqiMqzqZrzae4UqVCkYqcR9gQx66Ehq7hPmCxJCkg7ajo7fu6E7dPd34KH2HSYRsaaEA_BcKTeb9H1XE_qEKjog68wUU9Ekfl3FBIRN-1Ah_BoktGFoXyi_jt0-L0-gKcL1BLmUlGzMusvRbjI_0-qj-mc0utGdRjY-xIN2yBj8vl4DODO-wMwfp-cqZbCd9TENyHaTb8iA27s-73L3ExOQ'
            }
          ]
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeys((err, keys) => {
        expect(err).to.be.null;
        expect(keys).not.to.be.null;
        expect(keys.length).to.equal(3);
        expect(keys[0].rsaPublicKey).not.to.be.null;
        expect(keys[0].getPublicKey()).to.equal(keys[0].rsaPublicKey);
        expect(keys[0].kid).to.equal('IdTokenSigningKeyContainer');
        expect(keys[1].kid).to.equal('IdTokenSigningKeyContainer.v2');
        expect(keys[1].rsaPublicKey).not.to.be.null;
        expect(keys[1].getPublicKey()).to.equal(keys[1].rsaPublicKey);
        expect(keys[1].nbf).to.equal(1459289287);
        expect(keys[2].rsaPublicKey).not.to.be.null;
        expect(keys[2].getPublicKey()).to.equal(keys[2].rsaPublicKey);
        done();
      });
    });

    it('should only take the signing keys from the keys', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, {
          keys: [
            {
              kty: 'something',
              use: 'else',
              x5c: [
                'MIIDDTCCAfWgAwIBAgIJAJVkuSv2H8mDMA0GCSqGSIb3DQEBBQUAMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTAeFw0xNDA1MTQyMTIyMjZaFw0yODAxMjEyMTIyMjZaMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL6jWASkHhXz5Ug6t5BsYBrXDIgrWu05f3oq2fE+5J5REKJiY0Ddc+Kda34ZwOptnUoef3JwKPDAckTJQDugweNNZPwOmFMRKj4xqEpxEkIX8C+zHs41Q6x54ZZy0xU+WvTGcdjzyZTZ/h0iOYisswFQT/s6750tZG0BOBtZ5qS/80tmWH7xFitgewdWteJaASE/eO1qMtdNsp9fxOtN5U/pZDUyFm3YRfOcODzVqp3wOz+dcKb7cdZN11EYGZOkjEekpcedzHCo9H4aOmdKCpytqL/9FXoihcBMg39s1OW3cfwfgf5/kvOJdcqR4PoATQTfsDVoeMWVB4XLGR6SC5kCAwEAAaNQME4wHQYDVR0OBBYEFHDYn9BQdup1CoeoFi0Rmf5xn/W9MB8GA1UdIwQYMBaAFHDYn9BQdup1CoeoFi0Rmf5xn/W9MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAGLpQZdd2ICVnGjc6CYfT3VNoujKYWk7E0shGaCXFXptrZ8yaryfo6WAizTfgOpQNJH+Jz+QsCjvkRt6PBSYX/hb5OUDU2zNJN48/VOw57nzWdjI70H2Ar4oJLck36xkIRs/+QX+mSNCjZboRwh0LxanXeALHSbCgJkbzWbjVnfJEQUP9P/7NGf0MkO5I95C/Pz9g91y8gU+R3imGppLy9Zx+OwADFwKAEJak4JrNgcjHBQenakAXnXP6HG4hHH4MzO8LnLiKv8ZkKVL67da/80PcpO0miMNPaqBBMd2Cy6GzQYE0ag6k0nk+DMIFn7K+o21gjUuOEJqIbAvhbf2KcM='
              ],
              n:
                'vqNYBKQeFfPlSDq3kGxgGtcMiCta7Tl_eirZ8T7knlEQomJjQN1z4p1rfhnA6m2dSh5_cnAo8MByRMlAO6DB401k_A6YUxEqPjGoSnESQhfwL7MezjVDrHnhlnLTFT5a9MZx2PPJlNn-HSI5iKyzAVBP-zrvnS1kbQE4G1nmpL_zS2ZYfvEWK2B7B1a14loBIT947Woy102yn1_E603lT-lkNTIWbdhF85w4PNWqnfA7P51wpvtx1k3XURgZk6SMR6Slx53McKj0fho6Z0oKnK2ov_0VeiKFwEyDf2zU5bdx_B-B_n-S84l1ypHg-gBNBN-wNWh4xZUHhcsZHpILmQ',
              e: 'AQAB',
              kid: 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg',
              x5t: 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg'
            },
            {
              kty: 'something',
              use: 'else',
              nbf: 123,
              x5c: [
                'MIIDGzCCAgOgAwIBAgIJAPQM5+PwmOcPMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMMGXNhbmRyaW5vLWRldi5ldS5hdXRoMC5jb20wHhcNMTUwMzMxMDkwNTQ3WhcNMjgxMjA3MDkwNTQ3WjAkMSIwIAYDVQQDDBlzYW5kcmluby1kZXYuZXUuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv/SECtT7H4rxKtX2HpGhSyeYTe3Vet8YQpjBAr+1TnQ1fcYfvfmnVRHvhmTwABktD1erF1lxFsrRw92yBDOHlL7lj1n2fcfLftSoStgvRHVg52kR+CkBVQ6/mF1lYkefIjik6YRMf55Eu4FqDyVG2dgd5EA8kNO4J8OPc7vAtZyXrRYOZjVXbEgyjje/V+OpMQxAHP2Er11TLuzJjioP0ICVqhAZdq2sLk7agoxn64md6fqOk4N+7lJkU4+412VD0qYwKxD7nGsEclYawKoZD9/xhCk2qfQ/HptIumrdQ5ox3Sq5t2a7VKa41dBUQ1MQtXG2iY7S9RlfcMIyQwGhOQIDAQABo1AwTjAdBgNVHQ4EFgQUHpS1fvO/54G2c1VpEDNUZRSl44gwHwYDVR0jBBgwFoAUHpS1fvO/54G2c1VpEDNUZRSl44gwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAtm9I0nr6eXF5aq4yllfiqZcQ6mKrJLH9Rm4Jv+olniNynTcnpwprRVLToIawc8MmzIGZTtCn7u+dSxWf1UNE+SH7XgEnGtO74239vleEx1+Tf5viIdsnCxgvFiPdOqRlc9KcFSWd6a7RzcglnyU7GEx0K5GLv1wPA6qEM+3uwNwjAyVSu5dFw8kCfaSvlk5rXKRUzSoW9NVomw6+tADR8vMZS+4KThZ+4GH0rMN4KjIaRFxW8OMVYOn12uq33fLCd6MuPHW/rklxLbQBoHIU/ClNhbD0t6f00w9lHhPy4IP73rv7Oow0Ny6i70Iq0ijqj+kAtnrphlOvLFxqn6nCvQ=='
              ],
              n:
                'v_SECtT7H4rxKtX2HpGhSyeYTe3Vet8YQpjBAr-1TnQ1fcYfvfmnVRHvhmTwABktD1erF1lxFsrRw92yBDOHlL7lj1n2fcfLftSoStgvRHVg52kR-CkBVQ6_mF1lYkefIjik6YRMf55Eu4FqDyVG2dgd5EA8kNO4J8OPc7vAtZyXrRYOZjVXbEgyjje_V-OpMQxAHP2Er11TLuzJjioP0ICVqhAZdq2sLk7agoxn64md6fqOk4N-7lJkU4-412VD0qYwKxD7nGsEclYawKoZD9_xhCk2qfQ_HptIumrdQ5ox3Sq5t2a7VKa41dBUQ1MQtXG2iY7S9RlfcMIyQwGhOQ',
              e: 'AQAB',
              kid: 'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA',
              x5t: 'NkFCNEE1NDFDNTQ5RTQ5OTE1QzRBMjYyMzY0NEJCQTJBMjJBQkZCMA'
            }
          ]
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeys(err => {
        expect(err).not.to.be.null;
        expect(err.name).to.equal('JwksError');
        expect(err.message).to.equal(
          'The JWKS endpoint did not contain any signing keys'
        );
        done();
      });
    });
  
    describe('#getKeysInterceptor', () => {
      it('should return a matching key provided from the interceptor', done => {
        const client = new JwksClient({ 
          jwksUri: 'http://invalidUri',
          getKeysInterceptor: (cb) => cb(null, jwksObject.keys)
        });
  
        client.getSigningKey('abc', (err, key) => {
          expect(err).to.be.null;
          expect(key).not.to.be.null;
          expect(key.kid).to.equal(jwksObject.keys[0].kid);
          done();
        });
      });
  
      it('should fallback to using the jwksUri when key is not found in the interceptor', done => {
        nock(jwksHost)
          .get('/.well-known/jwks.json')
          .reply(200, {
            keys: [
              {
                kid: 'nonExistentKid',
                use: 'sig',
                kty: 'RSA',
                e: 'AQAB',
                n:
                  'tLDZVZ2Eq_DFwNp24yeSq_Ha0MYbYOJs_WXIgVxQGabu5cZ9561OUtYWdB6xXXZLaZxFG02P5U2rC_CT1r0lPfC_KHYrviJ5Y_Ekif7iFV_1omLAiRksQziwA1i-hND32N5kxwEGNmZViVjWMBZ43wbIdWss4IMhrJy1WNQ07Fqp1Ee6o7QM1hTBve7bbkJkUAfjtC7mwIWqZdWoYIWBTZRXvhMgs_Aeb_pnDekosqDoWQ5aMklk3NvaaBBESqlRAJZUUf5WDFoJh7yRELOFF4lWJxtArTEiQPWVTX6PCs0klVPU6SRQqrtc4kKLCp1AC5EJqPYRGiEJpSz2nUhmAQ'
              }
            ]
          });

        const client = new JwksClient({ 
          jwksUri: `${jwksHost}/.well-known/jwks.json`,
          getKeysInterceptor: (cb) => cb(null, jwksObject.keys)
        });
  
        client.getSigningKey('nonExistentKid', (err, key) => {
          expect(err).to.be.null;
          expect(key).not.to.be.null;
          expect(key.kid).to.equal('nonExistentKid');
          done();
        });
      });
    });

    it('should handle errors passed from the interceptor', done => {
      const error = new Error('interceptor error');
      const client = new JwksClient({ 
        jwksUri: 'http://invalidUri',
        getKeysInterceptor: (cb) => cb(error)
      });

      client.getSigningKey('abc', (err) => {
        expect(err).not.to.be.null;
        expect(err).to.equal(error);
        done();
      });
    });
  });

  describe('#getSigningKeysAsync', () => {
    it('should handle errors when async', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(500, 'Unknown Server Error');

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeysAsync()
        .catch(err => {
          expect(err).not.to.be.null;
          expect(err.message).to.equal('Unknown Server Error');
          done();
        });
    });

    it('should return signing keys to promise success handler when async', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, {
          keys: [
            {
              kid: 'IdTokenSigningKeyContainer',
              use: 'sig',
              kty: 'RSA',
              e: 'AQAB',
              n:
                'tLDZVZ2Eq_DFwNp24yeSq_Ha0MYbYOJs_WXIgVxQGabu5cZ9561OUtYWdB6xXXZLaZxFG02P5U2rC_CT1r0lPfC_KHYrviJ5Y_Ekif7iFV_1omLAiRksQziwA1i-hND32N5kxwEGNmZViVjWMBZ43wbIdWss4IMhrJy1WNQ07Fqp1Ee6o7QM1hTBve7bbkJkUAfjtC7mwIWqZdWoYIWBTZRXvhMgs_Aeb_pnDekosqDoWQ5aMklk3NvaaBBESqlRAJZUUf5WDFoJh7yRELOFF4lWJxtArTEiQPWVTX6PCs0klVPU6SRQqrtc4kKLCp1AC5EJqPYRGiEJpSz2nUhmAQ'
            },
            {
              kid: 'IdTokenSigningKeyContainer.v2',
              nbf: 1459289287,
              use: 'sig',
              kty: 'RSA',
              e: 'AQAB',
              n:
                's4W7xjkQZP3OwG7PfRgcYKn8eRYXHiz1iK503fS-K2FZo-Ublwwa2xFZWpsUU_jtoVCwIkaqZuo6xoKtlMYXXvfVHGuKBHEBVn8b8x_57BQWz1d0KdrNXxuMvtFe6RzMqiMqzqZrzae4UqVCkYqcR9gQx66Ehq7hPmCxJCkg7ajo7fu6E7dPd34KH2HSYRsaaEA_BcKTeb9H1XE_qEKjog68wUU9Ekfl3FBIRN-1Ah_BoktGFoXyi_jt0-L0-gKcL1BLmUlGzMusvRbjI_0-qj-mc0utGdRjY-xIN2yBj8vl4DODO-wMwfp-cqZbCd9TENyHaTb8iA27s-73L3ExOQ'
            }
          ]
        });

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeysAsync()
        .then(keys => {
          expect(keys).to.not.be.null;
          expect(keys.length).to.equal(2);
          done();
        });
    });
  });

  describe('#getSigningKey', () => {
    it('should return error if signing key is not found', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(200, x5cMultiple);

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKey('1234', err => {
        expect(err).not.to.be.null;
        expect(err.name).to.equal('SigningKeyNotFoundError');
        done();
      });
    });
  });

  describe('#getSigningKeyAsync', () => {
    it('should handle error when async', done => {
      nock(jwksHost)
        .get('/.well-known/jwks.json')
        .reply(500, 'Unknown Server Error');

      const client = new JwksClient({
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      });

      client.getSigningKeyAsync('')
        .catch(err => {
          expect(err).not.to.be.null;
          expect(err.message).to.equal('Unknown Server Error');
          done();
        });
    });
  });
});
