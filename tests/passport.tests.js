import request from 'supertest';
import { expect } from 'chai';
import Express from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

import { jwksEndpoint } from './mocks/jwks.js';
import { publicKey, privateKey, randomPublicKey1 } from './mocks/keys.js';
import { createToken, createSymmetricToken } from './mocks/tokens.js';

import { passportJwtSecret, ArgumentError, SigningKeyNotFoundError } from '../src/index.js';

describe('passportJwtSecret', () => {
  it('should throw error if options is null', () => {
    let err = null;

    try {
      // @ts-ignore
      new passportJwtSecret();
    } catch (e) {
      err = e;
    }

    expect(err instanceof ArgumentError).to.be.true;
  });

  it('should throw error if options.jwksUri is null', () => {
    let err = null;

    try {
      // @ts-ignore
      new passportJwtSecret({});
    } catch (e) {
      err = e;
    }

    expect(err instanceof ArgumentError).to.be.true;
  });

  it('should accept the secret function', () => {
    new JwtStrategy(
      {
        secretOrKeyProvider: passportJwtSecret({
          jwksUri: 'http://localhost/.well-known/jwks.json'
        }),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
      },
      (jwt_payload, done) => done(null, jwt_payload)
    );
  });

  it('should not provide a key if token is invalid', (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    // @ts-ignore
    let expectedFlashMessage;
    app.get(
      '/',
      // @ts-ignore
      (req, res, next) => {
        // @ts-ignore
        req.flash = (type, msg) => {
          expectedFlashMessage = msg;
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      // @ts-ignore
      (req, res) => {
        res.send('OK');
      }
    );

    request(app.listen())
      .get('/')
      .set('Authorization', 'Bearer abc')
      .expect(401)
      .end(() => {
        // @ts-ignore
        expect(expectedFlashMessage).to.equal('jwt malformed');
        done();
      });
  });

  it('should not provide a key if token is HS256', (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    // @ts-ignore
    let expectedFlashMessage;
    app.get(
      '/',
      // @ts-ignore
      (req, res, next) => {
        // @ts-ignore
        req.flash = (type, msg) => {
          expectedFlashMessage = msg;
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      // @ts-ignore
      (req, res) => {
        res.send('OK');
      }
    );

    const token = createSymmetricToken('mykey', { sub: 'john' });

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .end(() => {
        // @ts-ignore
        expect(expectedFlashMessage).to.equal('secret or public key must be provided');
        done();
      });
  });

  it('should not provide a key if JWKS endpoint returned multiple keys and no KID was provided', (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    // @ts-ignore
    let expectedFlashMessage;
    app.get(
      '/',
      // @ts-ignore
      (req, res, next) => {
        // @ts-ignore
        (req.flash = (type, msg) => {
          expectedFlashMessage = msg;
        }),
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      // @ts-ignore
      (req, res) => {
        res.send('OK');
      }
    );

    const token = createToken(privateKey, null, { sub: 'john' });
    jwksEndpoint('http://localhost', [
      { pub: publicKey, kid: '123' },
      { pub: publicKey, kid: '456' }
    ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .end((err) => {
        // @ts-ignore
        expect(expectedFlashMessage).to.equal('secret or public key must be provided');
        done(err);
      });
  });

  it('should not provide a key if token is RS256 and invalid KID was provided', (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => {
          done(null, jwt_payload);
        }
      )
    );

    // @ts-ignore
    let expectedFlashMessage;
    app.get(
      '/',
      // @ts-ignore
      (req, res, next) => {
        // @ts-ignore
        req.flash = (type, msg) => {
          expectedFlashMessage = msg;
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      // @ts-ignore
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
      .end(() => {
        // @ts-ignore
        expect(expectedFlashMessage).to.equal('secret or public key must be provided');
        done();
      });
  });

  it("should not authenticate the user if KID matches but the keys don't", (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => {
          done(null, jwt_payload);
        }
      )
    );

    // @ts-ignore
    let expectedFlashMessage;
    app.get(
      '/',
      // @ts-ignore
      (req, res, next) => {
        // @ts-ignore
        req.flash = (type, msg) => {
          expectedFlashMessage = msg;
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      // @ts-ignore
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
      .end(() => {
        // @ts-ignore
        expect(expectedFlashMessage).to.equal('invalid signature');
        done();
      });
  });

  it('should allow returning an error if key not found', (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json',
            handleSigningKeyError: (err, cb) => {
              if (err instanceof SigningKeyNotFoundError) {
                return cb(new Error('this is bad'));
              }
            }
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    // @ts-ignore
    let expectedFlashMessage;
    app.get(
      '/',
      // @ts-ignore
      (req, res, next) => {
        // @ts-ignore
        req.flash = (type, msg) => {
          expectedFlashMessage = msg;
        };
        next();
      },
      passport.authenticate('jwt', { session: false, failureFlash: true }),
      // @ts-ignore
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
      .end(() => {
        // @ts-ignore
        expect(expectedFlashMessage).to.equal('this is bad');
        done();
      });
  });

  it('should work if the token matches a signing key', (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          algorithms: [ 'RS256' ]
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    // @ts-ignore
    app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
      res.json(req.user);
    });

    const token = createToken(privateKey, '123', { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: publicKey, kid: '123' } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, res) => {
        expect(res.body.sub).to.equal('john');
        done();
      });
  });

  it('should work if the JWKS endpoint returns a single key and no KID is provided', (done) => {
    // @ts-ignore
    const app = new Express();
    passport.use(
      new JwtStrategy(
        {
          secretOrKeyProvider: passportJwtSecret({
            jwksUri: 'http://localhost/.well-known/jwks.json'
          }),
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          algorithms: [ 'RS256' ]
        },
        (jwt_payload, done) => done(null, jwt_payload)
      )
    );

    // @ts-ignore
    app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
      res.json(req.user);
    });

    const token = createToken(privateKey, null, { sub: 'john' });
    jwksEndpoint('http://localhost', [ { pub: publicKey } ]);

    request(app.listen())
      .get('/')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end((_err, res) => {
        expect(res.body.sub).to.equal('john');
        done();
      });
  });
});
