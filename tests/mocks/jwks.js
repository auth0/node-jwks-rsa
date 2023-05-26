const nock = require('nock');
const jose2 = require('jose');

function jwksEndpoint(host, certs) {
  return nock(host)
    .get('/.well-known/jwks.json')
    .reply(200, {
      keys: certs.map(cert => {
        const parsed = jose.JWK.asKey(cert.pub).toJWK();
        return {
          ...parsed,
          use: 'sig',
          kid: cert.kid
        };
      })
    });
}

module.exports = {
  jwksEndpoint
};
