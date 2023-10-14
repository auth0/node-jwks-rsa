import nock from 'nock';
import { expect } from 'chai';

import { request } from '../src/wrappers/request.js';

describe('Request wrapper tests', () => {
  const jwksHost = 'http://my-authz-server';
  const uri = `${jwksHost}/.well-known/jwks.json`;
  const jwksJson = {
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

  beforeEach(() => {
    nock.cleanAll();
  });

  it('should make a successful request to specified uri', (done) => {
    nock(jwksHost).get('/.well-known/jwks.json').reply(200, jwksJson);

    request({ uri })
      .then((data) => {
        expect(data).to.deep.equal(jwksJson);
        done();
      })
      .catch(done);
  });

  it('should handle errors', (done) => {
    const errorMsg = 'Server response error!!';
    nock(jwksHost)
      .get('/.well-known/jwks.json')
      .reply(500, function () {
        this.req.response.statusMessage = errorMsg;
      });

    request({ uri })
      .then(() => done('Shoul dhave thrown error'))
      .catch((err) => {
        expect(err.errorMsg).to.eql(errorMsg);
        done();
      });
  });

  it('should set a timeout when specified', (done) => {
    const timeout = 999999;

    nock(jwksHost)
      .get('/.well-known/jwks.json')
      .reply(200, function () {
        const { options } = this.req;
        expect(options.timeout).to.equal(timeout);
        done();
      });

    request({ uri, timeout });
  });

  it('should destroy the request when reaches the timeout', (done) => {
    const timeout = 5;
    const latency = timeout + 5;
    const errorCode = 'ECONNRESET';

    nock(jwksHost).get('/.well-known/jwks.json').delay(latency).reply(200, jwksJson);

    request({ uri, timeout })
      .then(() => done('Should have thrown error'))
      .catch((err) => {
        expect(err.code).to.eql(errorCode);
        done();
      });
  });

  it('should set modify headers when specified in options', (done) => {
    const headers = { test: '123' };

    nock(jwksHost)
      .get('/.well-known/jwks.json')
      .reply(200, function () {
        const { options } = this.req;
        expect(options.headers.test).to.equal(headers.test);
        done();
      });

    request({ uri, headers });
  });

  it('should set an agent when specified', (done) => {
    const agent = { testAgent: true };

    nock(jwksHost)
      .get('/.well-known/jwks.json')
      .reply(200, function () {
        const { options } = this.req;
        expect(options.agent).to.equal(agent);
        done();
      });

    request({ uri, agent });
  });

  describe('when fetcher is specified', () => {
    it('should use the specified fetcher to make the request', (done) => {
      request({
        uri,
        fetcher: (url) =>
          new Promise((resolve) => {
            expect(url).to.equal(uri);
            resolve(jwksJson);
          })
      })
        .then((data) => {
          expect(data).to.deep.equal(jwksJson);
          done();
        })
        .catch(done);
    });
  });
});
