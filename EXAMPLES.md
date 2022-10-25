# Examples

- [Integrations](#integrations)
- [Configuration](#configuration)
- [Caching](#caching)
- [Rate Limiting](#rate-limiting)
- [Using Request Agent for TLS/SSL Configuration](#using-request-agent-for-tlsssl-configuration)
- [Proxy Configuration](#proxy-configuration)
- [Loading keys from local file, environment variable, or other externals](#loading-keys-from-local-file-environment-variable-or-other-externals)
- [Showing Trace Logs](#showing-trace-logs)

## Integrations

This repository holds a number of example integrations found in the [examples](./examples/) folder.

- [express/express-jwt](examples/express-demo)
- [express/passport-jwt](examples/passport-demo)
- [hapi/hapi-auth-jwt2](examples/hapi-demo)
- [koa/koa-jwt](examples/koa-demo)


## Configuration

- `jwksUri`: a string that represents the JWKS URI
- `timeout = 30000`: (_optional_) an integer in miliseconds that controls the request timeout
- `cache = true`: (_optional_) enables a LRU Cache [(details)](#caching)
- `rateLimit`: (_optional_) the default fetcher function [(details)](#rate-limiting)
- `fetcher`: (_optional_) a Promise returning function to fetch data from the JWKS URI
- `requestHeaders`: (_optional_) an object of headers to pass to the request
- `requestAgent`: (_optional_) a Node `http.Agent` to be passed to the http(s) request
- `getKeysInterceptor`: (_optional_) a promise returning function hook [(details)](#loading-keys-from-local-file-environment-variable-or-other-externals)
- `cacheMaxAge`: (_optional_) the duration for which to store a cached JWKS in ms (default 600,000 or 10 minutes)
- `jwksRequestsPerMinute`: (_optional_) max number of requests allowed to the JWKS URI per minute (defaults to 10)

## Caching

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

## Rate Limiting

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

## Using Request Agent for TLS/SSL Configuration

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

## Proxy configuration

You can configure a proxy with using a [custom http(s) agent](https://github.com/TooTallNate/node-https-proxy-agent) in the `requestAgent` option.

## Loading keys from local file, environment variable, or other externals

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
