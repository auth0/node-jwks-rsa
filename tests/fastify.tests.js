import request from 'supertest';
import { expect } from 'chai';

import { jwksEndpoint } from './mocks/jwks';
import { publicKey, privateKey, randomPublicKey1 } from './mocks/keys';
import { createToken, createSymmetricToken } from './mocks/tokens';

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

  it('should through an error if alg is not RS256', done => {
    const fastify = Fastify();

    fastify.register(fastifyJwt, {
      secret: jwksRsa.fastifyJwtSecret({
        jwksUri: 'http://localhost/.well-known/jwks.json'
      }),
      algorithms: ['RS256'],
    })

    request(fastify.listen())
      .get('/')
      .set('Authorization', 'Bearer abc')
      .expect(401)
      .end((err, res) => {
        expect(res.text).to.equal('Invalid token');
        done();
      });
  });

});