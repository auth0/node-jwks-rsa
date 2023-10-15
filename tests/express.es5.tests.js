import nock from 'nock';
import { expect } from 'chai';
import { expressjwt as expressJwt7 } from 'express-jwt-v7';
import { expressjwt as expressJwt8 } from 'express-jwt';
import expressJwt6 from 'express-jwt-v6';

import { jwksEndpoint } from './mocks/jwks.js';
import { publicKey, privateKey, randomPublicKey1 } from './mocks/keys.js';
import { createToken, createSymmetricToken } from './mocks/tokens.js';

import { expressJwtSecret, ArgumentError, SigningKeyNotFoundError } from '../src/index.js';

const suites = [
  {
    description: 'expressJwtSecret for express-jwt@8',
    expressJwt: expressJwt8,
    reqProperty: 'auth'
  },
  {
    description: 'expressJwtSecret for express-jwt@7',
    expressJwt: expressJwt7,
    reqProperty: 'auth'
  },
  {
    description: 'expressJwtSecret for express-jwt@6',
    expressJwt: expressJwt6,
    reqProperty: 'user'
  }
];

suites.forEach(({ description, expressJwt, reqProperty }) => {
  describe(description, () => {
    it('should throw error if options is null', () => {
      let err = null;

      try {
        // @ts-ignore
        new expressJwtSecret();
      } catch (e) {
        err = e;
      }

      expect(err instanceof ArgumentError).to.be.true;
    });

    describe('#expressJwt', () => {
      beforeEach(() => {
        nock.cleanAll();
      });

      it('should accept the secret function', () => {
        expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          algorithms: [ 'RS256' ]
        });
      });

      it('should not provide a key if token is invalid', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          algorithms: [ 'RS256' ]
        });

        // @ts-ignore
        middleware({ headers: { authorization: 'Bearer abc' } }, {}, function (err) {
          expect(err.code).to.equal('invalid_token');
          done();
        });
      });

      it('should not provide a key if token is HS256', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          algorithms: [ 'RS256' ]
        });

        const token = createSymmetricToken('mykey', { sub: 'john' });
        // @ts-ignore
        middleware({ headers: { authorization: `Bearer ${token}` } }, {}, function (err) {
          expect(err.code).to.equal('invalid_token');
          done();
        });
      });

      it('should not provide a key if JWKS endpoint returned multiple keys and no KID was provided', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          algorithms: [ 'RS256' ]
        });

        jwksEndpoint('http://localhost', [
          { pub: publicKey, kid: '123' },
          { pub: publicKey, kid: '456' }
        ]);

        const token = createToken(privateKey, null, { sub: 'john' });
        // @ts-ignore
        middleware({ headers: { authorization: `Bearer ${token}` } }, {}, function (err) {
          expect(err.message).to.equal('secret or public key must be provided');
          done();
        });
      });

      it('should not provide a key if token is RS256 and invalid KID was provided', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          algorithms: [ 'RS256' ]
        });

        jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

        const token = createToken(privateKey, '456', { sub: 'john' });
        // @ts-ignore
        middleware({ headers: { authorization: `Bearer ${token}` } }, {}, function (err) {
          expect(err.message).to.equal('secret or public key must be provided');
          done();
        });
      });

      it('should not authenticate the user if KID matches but the keys dont', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          algorithms: [ 'RS256' ]
        });

        jwksEndpoint('http://localhost', [ { pub: randomPublicKey1, kid: '123' } ]);

        const token = createToken(privateKey, '123', { sub: 'john' });
        // @ts-ignore
        middleware({ headers: { authorization: `Bearer ${token}` } }, {}, function (err) {
          expect(err.message).to.equal('invalid signature');
          done();
        });
      });

      it('should allow returning an error if key not found', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json',
            handleSigningKeyError: (err, cb) => {
              if (err instanceof SigningKeyNotFoundError) {
                cb(new Error('This is bad'));
              }
            }
          }),
          algorithms: [ 'RS256' ]
        });

        jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

        const token = createToken(privateKey, '456', { sub: 'john' });
        // @ts-ignore
        middleware({ headers: { authorization: `Bearer ${token}` } }, {}, function (err) {
          expect(err.message).to.equal('This is bad');
          done();
        });
      });

      it('should work if the token matches a signing key', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json',
            handleSigningKeyError: (err, cb) => {
              if (err instanceof SigningKeyNotFoundError) {
                cb(new Error('This is bad'));
              }
            }
          }),
          algorithms: [ 'RS256' ]
        });

        jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

        const token = createToken(privateKey, '123', { sub: 'john' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        // @ts-ignore
        middleware(req, {}, function (err) {
          expect(err).to.be.undefined;
          // @ts-ignore
          expect(req[reqProperty].sub).to.equal('john');
          done();
        });
      });

      it('should work if the JWKS endpoint returns a single key and no KID is provided', (done) => {
        const middleware = expressJwt({
          // @ts-ignore
          secret: expressJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json',
            handleSigningKeyError: (err, cb) => {
              if (err instanceof SigningKeyNotFoundError) {
                cb(new Error('This is bad'));
              }
            }
          }),
          algorithms: [ 'RS256' ]
        });

        jwksEndpoint('http://localhost', [ { pub: publicKey } ]);

        const token = createToken(privateKey, undefined, { sub: 'john' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        // @ts-ignore
        middleware(req, {}, function (err) {
          expect(err).to.be.undefined;
          // @ts-ignore
          expect(req[reqProperty].sub).to.equal('john');
          done();
        });
      });
    });
  });
});
