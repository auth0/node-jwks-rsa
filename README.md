# jwks-rsa

[![CircleCI][circle-image]][circle-url]
[![codecov][codecov-image]][codecov-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fauth0%2Fnode-jwks-rsa.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fauth0%2Fnode-jwks-rsa?ref=badge_shield)

A library to retrieve RSA signing keys from a JWKS (JSON Web Key Set) endpoint.

> npm install --save jwks-rsa

## Usage

You'll provide the client with the JWKS endpoint which exposes your signing keys. Using the `getSigningKey` you can then get the signing key that matches a specific `kid`.

```js
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  strictSsl: true, // Default value
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  requestAgentOptions: {}, // Optional
  timeout: 30000, // Defaults to 30s
  proxy: '[protocol]://[username]:[pass]@[address]:[port]', // Optional
});

const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
client.getSigningKey(kid, (err, key) => {
  const signingKey = key.getPublicKey();

  // Now I can use this to configure my Express or Hapi middleware
});
```

> Note that all methods on the `JwksClient` have asynchronous equivalents, where the promisified name is suffixed with `Async`, e.g., `client.getSigningKeyAsync(kid).then(key => { /* ... */ })`;

Integrations are also provided with:

 - [express/express-jwt](examples/express-demo)
 - [express/passport-jwt](examples/passport-demo)
 - [hapi/hapi-auth-jwt2](examples/hapi-demo)
 - [koa/koa-jwt](examples/koa-demo)

### Caching

By default, signing key verification results are cached in order to prevent excessive HTTP requests to the JWKS endpoint. If a signing key matching the `kid` is found, this will be cached and the next time this `kid` is requested the signing key will be served from the cache.  The caching behavior can be configured as seen below:

```js
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  cache: true, // Default Value
  cacheMaxEntries: 5, // Default value
  cacheMaxAge: 10000, // Defaults to 10s
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json'
});

const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
client.getSigningKey(kid, (err, key) => {
  const signingKey = key.getPublicKey();

  // Now I can use this to configure my Express or Hapi middleware
});
```

### Rate Limiting

Even if caching is enabled the library will call the JWKS endpoint if the `kid` is not available in the cache, because a key rotation could have taken place. To prevent attackers to send many random `kid`s you can also configure rate limiting. This will allow you to limit the number of calls that are made to the JWKS endpoint per minute (because it would be highly unlikely that signing keys are rotated multiple times per minute).

```js
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json'
});

const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
client.getSigningKey(kid, (err, key) => {
  const signingKey = key.getPublicKey();

  // Now I can use this to configure my Express or Hapi middleware
});
```

### Using AgentOptions for TLS/SSL Configuration

The `requestAgentOptions` property can be used to configure SSL/TLS options. An
example use case is providing a trusted private (i.e. enterprise/corporate) root
certificate authority to establish TLS communication with the `jwks_uri`.

```js
const jwksClient = require("jwks-rsa");
const client = jwksClient({
  strictSsl: true, // Default value
  jwksUri: 'https://my-enterprise-id-provider/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  requestAgentOptions: {
    ca: fs.readFileSync(caFile)
  }
});
```

For more information, see [the NodeJS request library `agentOptions`
documentation](https://github.com/request/request#using-optionsagentoptions).

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

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

[circle-image]: https://img.shields.io/circleci/build/github/auth0/node-jwks-rsa/master?style=flat-square
[circle-url]: https://circleci.com/gh/auth0/node-jwks-rsa/tree/master
[codecov-image]: https://img.shields.io/codecov/c/github/auth0/node-jwks-rsa?style=flat-square
[codecov-url]: https://codecov.io/gh/auth0/node-jwks-rsa
[npm-image]: https://img.shields.io/npm/v/jwks-rsa.svg?style=flat-square
[npm-url]: https://npmjs.org/package/jwks-rsa
[license-image]: http://img.shields.io/npm/l/jwks-rsa.svg?style=flat-square
[license-url]: #license
[downloads-image]: http://img.shields.io/npm/dm/jwks-rsa.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/jwks-rsa


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fauth0%2Fnode-jwks-rsa.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fauth0%2Fnode-jwks-rsa?ref=badge_large)
