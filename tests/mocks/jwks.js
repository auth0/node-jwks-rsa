import nock from 'nock';
// @ts-ignore
import { JWK } from 'jose2';

// @ts-ignore
export function jwksEndpoint(host, certs) {
  return nock(host)
    .get('/.well-known/jwks.json')
    .reply(200, {
      // @ts-ignore
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
