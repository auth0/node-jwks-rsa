import request from 'supertest';
import { expect } from 'chai';

import { jwksEndpoint } from './mocks/jwks';
import { publicKey, privateKey, randomPublicKey1 } from './mocks/keys';
import { createToken, createSymmetricToken } from './mocks/tokens';

const Express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const jwksRsa = require('../src');

describe('passportJwtSecret', () => {
  it('should throw error if options.jwksUri is null', () => {
    let err = null;

    try {
      new jwksRsa.passportJwtSecret();
    } catch (e) {
      err = e;
    }

    expect(err instanceof jwksRsa.ArgumentError).to.be.true;
  });

  it('should accept the secret function', () => {
    new JwtStrategy(
      {
        secretOrKeyProvider: jwksRsa.passportJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        }),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      },
      (jwt_payload, done) => done(null, jwt_payload)
    );
  });

  it('should not provide a key if token is invalid', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    app.get(
      '/',
      (req, res, next) => {
        req.flash = (type, msg) => {
          res.send(msg);
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      (req, res) => {
        res.send('OK');
      }
    );

    request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer abc')
      .expect(401)
      .end((err, res) => {
        expect(res.text).to.equal('jwt malformed');
        done();
      });
  });

  it('should not provide a key if token is HS256', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    app.get(
      '/',
      (req, res, next) => {
        req.flash = (type, msg) => {
          res.send(msg);
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      (req, res) => {
        res.send('OK');
      }
    );

    const token = createSymmetricToken('mykey', { sub: 'john' });

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .end((err, res) => {
        expect(res.text).to.equal('secret or public key must be provided');
        done();
      });
  });

  it('should not provide a key if JWKS endpoint returned multiple keys and no KID was provided', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    app.get(
      '/',
      (req, res, next) => {
        req.flash = (type, msg) => {
          res.send(msg);
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      (req, res) => {
        res.send('OK');
      }
    );

    const token = createToken(privateKey, null, { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' }, { pub: publicKey, kid: '456' } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .end((err, res) => {
        expect(res.text).to.equal('secret or public key must be provided');
        done();
      });
  });

  it('should not provide a key if token is RS256 and invalid KID was provided', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => {
          done(null, jwt_payload);
        }
      )
    );

    app.get(
      '/',
      (req, res, next) => {
        req.flash = (type, msg) => {
          res.send(msg);
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      (req, res) => {
        res.send('OK');
      }
    );

    const token = createToken(privateKey, '456', { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .end((err, res) => {
        expect(res.text).to.equal('secret or public key must be provided');
        done();
      });
  });

  it('should not authenticate the user if KID matches but the keys don\'t', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => {
          done(null, jwt_payload);
        }
      )
    );

    app.get(
      '/',
      (req, res, next) => {
        req.flash = (type, msg) => {
          res.send(msg);
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      (req, res) => {
        res.send('OK');
      }
    );

    const token = createToken(privateKey, '123', { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: randomPublicKey1, kid: '123' } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .end((err, res) => {
        expect(res.text).to.equal('invalid signature');
        done();
      });
  });

  it('should allow returning an error if key not found', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json',
            handleSigningKeyError: (err, cb) => {
              if (err instanceof jwksRsa.SigningKeyNotFoundError) {
                return cb(new Error('this is bad'));
              }
            }
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    app.get(
      '/',
      (req, res, next) => {
        req.flash = (type, msg) => {
          res.send(msg);
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      (req, res) => {
        res.send('OK');
      }
    );

    const token = createToken(privateKey, '456', { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: randomPublicKey1, kid: '123' } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .end((err, res) => {
        expect(res.text).to.equal('this is bad');
        done();
      });
  });

  it('should work if the token matches a signing key', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          algorithms: [ 'RS256' ]
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    app.get(
      '/',
      passport.authenticate('jwt', { session: false }),
      (req, res) => {
        res.json(req.user);
      }
    );

    const token = createToken(privateKey, '123', { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.sub).to.equal('john');
        done();
      });
  });

  it('should work if the JWKS endpoint returns a single key and no KID is provided', done => {
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: jwksRsa.passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          algorithms: [ 'RS256' ]
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    app.get(
      '/',
      passport.authenticate('jwt', { session: false }),
      (req, res) => {
        res.json(req.user);
      }
    );

    const token = createToken(privateKey, null, { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: publicKey } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.sub).to.equal('john');
        done();
      });
  });
});
