# jwks-rsa

A library to retrieve RSA public keys from a JWKS (JSON Web Key Set) endpoint.

> npm install --save jwks-rsa

## Usage

```js
const jwksClient = require('jwksClient');

const client = jwksClient({
  cache: true, // Default value
  cacheMaxEntries: 5, // Default value
  cacheMaxAge = ms('10h'), // Default value
  strictSsl = true, // Default value
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json'
});

const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
client.getSigningKey(kid, (err, key) => {
  const signingKey = key.publicKey || key.rsaPublicKey;

  // Now I can use this to configure my Express or Hapi middleware
});
```

## Running Tests

```
npm run test
```

## Showing Trace Logs

To show trace logs you can set the following environment variable:

```
DEBUG=jwks
```

Output:

```
jwks Retrieving keys from http://my-authz-server/.well-known/jwks.json +5ms
jwks Keys: +8ms [ { alg: 'RS256',
  kty: 'RSA',
  use: 'sig',
  x5c: [ 'pk1' ],
  kid: 'ABC' },
{ alg: 'RS256', kty: 'RSA', use: 'sig', x5c: [], kid: '123' } ]
```
