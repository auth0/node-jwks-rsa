import request from 'supertest';
import http from 'http';
import { expect } from 'chai';

import { jwksEndpoint } from './mocks/jwks';
import { publicKey, privateKey, randomPublicKey1 } from './mocks/keys';
import { createToken, createSymmetricToken } from './mocks/tokens';

const Koa = require('koa');
const koaJwt = require('koa-jwt');

const jwksRsa = require('../src');

describe('koaJwtSecret', () => {
  it('should throw error if options.jwksUri is null', () => {
    let err = null;

    try {
      new jwksRsa.koaJwtSecret();
    } catch (e) {
      err = e;
    }

    expect(err instanceof jwksRsa.ArgumentError).to.be.true;
  });

    it('should accept the secret function', () => {
      koaJwt({
        secret: jwksRsa.koaJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        })
      });
    });

    it('should not provide a key if token is invalid', done => {

      const app = new Koa();
      app.use(koaJwt({
          secret: jwksRsa.koaJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          })
      }));

      request(app.listen())
          .get('/')
          .set('Authorization', 'Bearer abc')
          .expect(401)
          .end((err, res) => {
            expect(res.text).to.equal('Invalid Token');
            done();
          });
    });

    it('should not provide a key if token is HS256', (done) => {
        const app = new Koa();
        app.use(koaJwt({
            secret: jwksRsa.koaJwtSecret({
                jwksUri: 'http://localhost/.well-known/jwks.json'
            })
        }));

        const token = createSymmetricToken('mykey', { sub: 'john' });

        request(app.listen())
        .get('/')
        .set('Authorization', `Bearer ${ token }`)
        .expect(401)
        .end((err, res) => {
            expect(res.text).to.equal('Invalid Token');
            done();
        });
    });

    it('should not provide a key if token is RS256 and no KID was provided', (done) => {
        const app = new Koa();
        app.use(koaJwt({
            secret: jwksRsa.koaJwtSecret({
                jwksUri: 'http://localhost/.well-known/jwks.json'
            })
        }));

        const token = createSymmetricToken('mykey', { sub: 'john' });
        jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

        request(app.listen())
        .get('/')
        .set('Authorization', `Bearer ${ token }`)
        .expect(401)
        .end((err, res) => {
            expect(res.text).to.equal('secret or public key must be provided');
            done();
        });
    });

    it('should not provide a key if token is RS256 and invalid KID was provided', (done) => {
        const app = new Koa();
        app.use(koaJwt({
            secret: jwksRsa.koaJwtSecret({
                jwksUri: 'http://localhost/.well-known/jwks.json'
            })
        }));

        const token = createToken(privateKey, '456', { sub: 'john' });
        jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

        request(app.listen())
        .get('/')
        .set('Authorization', `Bearer ${ token }`)
        .expect(401)
        .end((err, res) => {
            expect(res.text).to.equal('secret or public key must be provided');
            done();
        });
    });

    it('should not authenticate the user if KID matches but the keys dont', (done) => {
        const app = new Koa();
        app.use(koaJwt({
            secret: jwksRsa.koaJwtSecret({
                jwksUri: 'http://localhost/.well-known/jwks.json'
            })
        }));

        const token = createToken(privateKey, '123', { sub: 'john' });
        jwksEndpoint('http://localhost', [ { pub: randomPublicKey1, kid: '123' } ]);

        request(app.listen())
        .get('/')
        .set('Authorization', `Bearer ${ token }`)
        .expect(401)
        .end((err, res) => {
            expect(res.text).to.equal('invalid signature');
            done();
        });
    });

    it('should allow returning an error if key not found', (done) => {

        const app = new Koa();
        app.use(koaJwt({
            secret: jwksRsa.koaJwtSecret({
                jwksUri: 'http://localhost/.well-known/jwks.json',
                handleSigningKeyError: (err, cb) => {
                    if (err instanceof jwksRsa.SigningKeyNotFoundError) {
                        cb(new Error('This is bad'));
                    }
                }
            })
        }));

        const token = createToken(privateKey, '456', { sub: 'john' });
        jwksEndpoint('http://localhost', [ { pub: randomPublicKey1, kid: '123' } ]);

        request(app.listen())
        .get('/')
        .set('Authorization', `Bearer ${ token }`)
        .expect(401)
        .end((err, res) => {
            expect(res.text).to.equal('this is bad');
            done();
        });
    });

    it('should work if the token matches a signing key', (done) => {
        const app = new Koa();
        app.use(koaJwt({
            secret: jwksRsa.koaJwtSecret({
                jwksUri: 'http://localhost/.well-known/jwks.json',
                handleSigningKeyError: (err, cb) => {
                    if (err instanceof jwksRsa.SigningKeyNotFoundError) {
                        cb(new Error('This is bad'));
                    }
                }
            })
        }));
        app.use((ctx) => {
          ctx.body = ctx.state.user;
          ctx.status = 200;
        });

        const token = createToken(privateKey, '123', { sub: 'john' });
        jwksEndpoint('http://localhost', [ { pub: randomPublicKey1, kid: '123' } ]);

        request(app.listen())
        .get('/')
        .set('Authorization', `Bearer ${ token }`)
        .expect(200)
        .end((err, res) => {
            expect(res.body.sub).to.equal('this is bad');
            done();
        });
    });

});
