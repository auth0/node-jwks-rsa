import request from 'supertest';
import { expect } from 'chai';

const Fastify = require('fastify');
const fastifyJwt = require('fastify-jwt');

const jwksRsa = require('../src');

describe('fastifyJwtSecret', () => {
  it('should throw error if options.jwksUri is null', () => {
    let err = null;

    try {
      new jwksRsa.fastifyJwtSecret();
    } catch (e) {
      err = e;
    }

    expect(err instanceof jwksRsa.ArgumentError).to.be.true;
  });

  it('should throw an error if token is invalid', done => {
    const fastify = Fastify();

    fastify.register(fastifyJwt, {
      secret: jwksRsa.fastifyJwtSecret({
        jwksUri: 'http://localhost/.well-known/jwks.json'
      }),
      algorithms: [ 'RS256' ],
      decode: { complete: true }
    });

    fastify.get('/auth-required', (request, reply) => {
      request.jwtVerify()
      .then(decoded => reply.send(decoded))
      .catch(err => reply.send(err));
    });

    fastify.listen()
    .then(address => {
      request(address)
        .get('/auth-required')
        .set('Authorization', 'Bearer abc')
        .expect(401)
        .end((err, res) => {
          expect(JSON.parse(res.text).message).to.equal('Invalid token');
          done();
        });
    });
  });
  it('should throw an error if algorithm is not RS256', done => {
    const fastify = Fastify();
    // token signed with HS256 alg
    // header:
    /**
      {
        "alg": "HS256",
        "typ": "JWT"
      }
    */
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';

    fastify.register(fastifyJwt, {
      secret: jwksRsa.fastifyJwtSecret({
        jwksUri: 'http://localhost/.well-known/jwks.json'
      }),
      algorithms: [ 'HS256' ],
      decode: { complete: true }
    });

    fastify.get('/auth-required', (request, reply) => {
      request.jwtVerify()
      .then(decoded => reply.send(decoded))
      .catch(err => reply.send(err));
    });


    fastify.listen()
    .then(address => {
      request(address)
        .get('/auth-required')
        .set('authorization', `Bearer ${token}`)
        .expect(401)
        .end((err, res) => {
          expect(JSON.parse(res.text).message).to.equal('Only RS256 is supported');
          done();
        });
    });
  });

});
