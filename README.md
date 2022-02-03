# jwks-rsa

[![CircleCI][circle-image]][circle-url]
[![codecov][codecov-image]][codecov-url]
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fauth0%2Fnode-jwks-rsa.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fauth0%2Fnode-jwks-rsa?ref=badge_shield)

A library to retrieve signing keys from a JWKS (JSON Web Key Set) endpoint.

> npm install --save jwks-rsa

Supports all currently registered JWK types and JWS Algorithms, see [panva/jose#262](https://github.com/panva/jose/issues/262) for more information.

## Usage

You'll provide the client with the JWKS endpoint which exposes your signing keys. Using the `getSigningKey` you can then get the signing key that matches a specific `kid`.

```js
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  timeout: 30000 // Defaults to 30s
});

const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
const key = await client.getSigningKey(kid);
const signingKey = key.getPublicKey();
```

### Integrations

 - [express/express-jwt](examples/express-demo)
 - [express/passport-jwt](examples/passport-demo)
 - [hapi/hapi-auth-jwt2](examples/hapi-demo)
 - [koa/koa-jwt](examples/koa-demo)

### API

#### JwksClient Options

- `jwksUri`: a string that represents the JWKS URI
- `timeout = 30000`: (_optional_) an integer in miliseconds that controls the request timeout
- `cache = true`: (_optional_) enables a LRU Cache [(details)](#caching)
- `rateLimit`: (_optional_) the default fetcher function [(details)](#rate-limiting)
- `fetcher`: (_optional_) a Promise returning function to fetch data from the JWKS URI
- `requestHeaders`: (_optional_) an object of headers to pass to the request
- `requestAgent`: (_optional_) a Node `http.Agent` to be passed to the http(s) request
- `getKeysInterceptor`: (_optional_) a promise returning function hook [(details)](#loading-keys-from-local-file-environment-variable-or-other-externals)

### Caching

By default, signing key verification results are cached in order to prevent excessive HTTP requests to the JWKS endpoint. If a signing key matching the `kid` is found, this will be cached and the next time this `kid` is requested the signing key will be served from the cache.  The caching behavior can be configured as seen below:

```js
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  cache: true, // Default Value
  cacheMaxEntries: 5, // Default value
  cacheMaxAge: 600000, // Defaults to 10m
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json'
});

const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
const key = await client.getSigningKey(kid);
const signingKey = key.getPublicKey();
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
const key = await client.getSigningKey(kid);
const signingKey = key.getPublicKey();
```

### Using Request Agent for TLS/SSL Configuration

The `requestAgent` property can be used to configure SSL/TLS options. An
example use case is providing a trusted private (i.e. enterprise/corporate) root
certificate authority to establish TLS communication with the `jwks_uri`.

```js
const jwksClient = require("jwks-rsa");
const https = require('https');
const client = jwksClient({
  jwksUri: 'https://my-enterprise-id-provider/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  requestAgent: new https.Agent({
    ca: fs.readFileSync(caFile)
  })
});
```

### Proxy configuration

You can configure a proxy with using a [custom http(s) agent](https://github.com/TooTallNate/node-https-proxy-agent) in the `requestAgent` option.

### Loading keys from local file, environment variable, or other externals

The `getKeysInterceptor` property can be used to fetch keys before sending a request to the `jwksUri` endpoint.  This can be helpful when wanting to load keys from a file, env variable, or an external cache. If a KID cannot be found in the keys returned from the interceptor, it will fallback to the `jwksUri` endpoint. This property will continue to work with the provided LRU cache, if the cache is enabled.

```js
  const client = new JwksClient({ 
    jwksUri: 'https://my-enterprise-id-provider/.well-known/jwks.json',
    getKeysInterceptor: () => {
      const file = fs.readFileSync(jwksFile);
      return file.keys;
    }
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
