import jwt from 'jsonwebtoken';

export function createToken(key, kid, payload) {
  return jwt.sign(payload, key, { noTimestamp: true, algorithm: 'RS256', header: { alg: 'RS256', kid } });
}

export function createSymmetricToken(key, payload) {
  return jwt.sign(payload, key, { noTimestamp: true, algorithm: 'HS256', header: { alg: 'HS256' } });
}
