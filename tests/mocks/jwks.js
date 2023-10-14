import nock from 'nock';
import { JWK } from 'jose2';

export function jwksEndpoint(host, certs) {
  return nock(host)
    .get('/.well-known/jwks.json')
    .reply(200, {
      keys: certs.map((cert) => {
        const parsed = JWK.asKey(cert.pub).toJWK();
        return {
          ...parsed,
          use: 'sig',
          kid: cert.kid
        };
      })
    });
}
