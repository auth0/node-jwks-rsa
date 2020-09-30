import nock from 'nock';
import jose from 'jose';

export function jwksEndpoint(host, certs) {
  return nock(host)
    .get('/.well-known/jwks.json')
    .reply(200, {
      keys: certs.map(cert => {
        const parsed = jose.JWK.asKey(cert.pub).toJWK();
        return {
          ...parsed,
          use: 'sig',
          x5c: [
            /-----BEGIN CERTIFICATE-----([^-]*)-----END CERTIFICATE-----/g.exec(cert.pub)[1].replace(/[\n|\r\n]/g, '')
          ],
          kid: cert.kid
        };
      })
    });
}
