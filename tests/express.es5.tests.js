import nock from 'nock';
import { expect } from 'chai';

import { jwksEndpoint } from './mocks/jwks';
import { publicKey, privateKey, randomPublicKey1 } from './mocks/keys';
import { createToken, createSymmetricToken } from './mocks/tokens';

const jwksRsa = require('../src');
const expressJwt = require('express-jwt');

describe('expressJwtSecret', () => {
  it('should throw error if options is null', () => {
    let err = null;

    try {
      new jwksRsa.expressJwtSecret();
    } catch (e) {
      err = e;
    }

    expect(err instanceof jwksRsa.ArgumentError).to.be.true;
  });

  describe('#expressJwt', () => {
    beforeEach(() => {
      nock.cleanAll();
    });

    it('should accept the secret function', () => {
      expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        })
      });
    });

    it('should not provide a key if token is invalid', () => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        })
      });

      middleware({ headers: { authorization: 'Bearer abc' } }, { }, function(err) {
        expect(err.code).to.equal('invalid_token');
      });
    });

    it('should not provide a key if token is HS256', (done) => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        })
      });

      const token = createSymmetricToken('mykey', { sub: 'john' });
      middleware({ headers: { authorization: `Bearer ${token}` } }, { }, function(err) {
        expect(err.code).to.equal('invalid_token');
        done();
      });
    });

    it('should not provide a key if JWKS endpoint returned multiple keys and no KID was provided', (done) => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        })
      });

      jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' }, { pub: publicKey, kid: '456' } ]);

      const token = createToken(privateKey, null, { sub: 'john' });
      middleware({ headers: { authorization: `Bearer ${token}` } }, { }, function(err) {
        expect(err.message).to.equal('secret or public key must be provided');
        done();
      });
    });

    it('should not provide a key if token is RS256 and invalid KID was provided', (done) => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        })
      });

      jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

      const token = createToken(privateKey, '456', { sub: 'john' });
      middleware({ headers: { authorization: `Bearer ${token}` } }, { }, function(err) {
        expect(err.message).to.equal('secret or public key must be provided');
        done();
      });
    });

    it('should not authenticate the user if KID matches but the keys dont', (done) => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        })
      });

      jwksEndpoint('http://localhost', [ { pub: randomPublicKey1, kid: '123' } ]);

      const token = createToken(privateKey, '123', { sub: 'john' });
      middleware({ headers: { authorization: `Bearer ${token}` } }, { }, function(err) {
        expect(err.message).to.equal('invalid signature');
        done();
      });
    });

    it('should allow returning an error if key not found', (done) => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json',
          handleSigningKeyError: (err, cb) => {
            if (err instanceof jwksRsa.SigningKeyNotFoundError) {
              cb(new Error('This is bad'));
            }
          }
        })
      });

      jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

      const token = createToken(privateKey, '456', { sub: 'john' });
      middleware({ headers: { authorization: `Bearer ${token}` } }, { }, function(err) {
        expect(err.message).to.equal('This is bad');
        done();
      });
    });

    it('should work if the token matches a signing key', (done) => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json',
          handleSigningKeyError: (err, cb) => {
            if (err instanceof jwksRsa.SigningKeyNotFoundError) {
              cb(new Error('This is bad'));
            }
          }
        })
      });

      jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

      const token = createToken(privateKey, '123', { sub: 'john' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      middleware(req, { }, function(err) {
        expect(err).to.be.undefined;
        expect(req.user.sub).to.equal('john');
        done();
      });
    });

    it('should work if the JWKS endpoint returns a single key and no KID is provided', (done) => {
      const middleware = expressJwt({
        secret: jwksRsa.expressJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json',
          handleSigningKeyError: (err, cb) => {
            if (err instanceof jwksRsa.SigningKeyNotFoundError) {
              cb(new Error('This is bad'));
            }
          }
        })
      });

      jwksEndpoint('http://localhost', [ { pub: publicKey } ]);

      const token = createToken(privateKey, undefined, { sub: 'john' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      middleware(req, { }, function(err) {
        expect(err).to.be.undefined;
        expect(req.user.sub).to.equal('john');
        done();
      });
    });
  });
});
