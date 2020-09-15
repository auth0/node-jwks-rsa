# jwks-rsa - Hapi Example

The `jwks-rsa` library provides a small helper that makes it easy to configure `hapi-auth-jwt2` with the `RS256` algorithm. Using `hapiJwt2Key` you can generate a key provider that will provide the right signing key to `hapi-auth-jwt2` based on the `kid` in the JWT header.

```js
const Hapi = require('hapi');
const jwt = require('hapi-auth-jwt2');
const jwksRsa = require('jwks-rsa');

...

// Start the server.
const server = new Hapi.Server();
server.connection({ port: 4001 });
server.register(jwt, (err) => {
  if (err) {
    logger(err);
  }

  server.auth.strategy('jwt', 'jwt', {
    // Get the complete decoded token, because we need info from the header (the kid)
    complete: true,

    // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.

    /* If you're using Hapi 17.x.x you have to use version 8.x.x of hapi-auth-jwt2
      (https://github.com/dwyl/hapi-auth-jwt2#compatibility) and use the promise based version jwksRsa.hapiJwt2KeyAsync instead of jwksRsa.hapiJwt2Key
    */

    key: jwksRsa.hapiJwt2Key({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 2,
      jwksUri: 'https://my-authz-server/.well-known/jwks.json'
    }),

    // Your own logic to validate the user.
    validateFunc: validateUser,

    // Validate the audience and the issuer.
    verifyOptions: {
      audience: 'urn:my-resource-server',
      issuer: 'https://my-authz-server/',
      algorithms: [ 'RS256' ]
    }
  });
  server.auth.default('jwt');

  server.route([
    {
      method: 'GET',
      path: '/me',
      config: { auth: 'jwt' },
      handler: (request, reply) => {
        // This is the user object
        reply(request.auth.credentials);
      }
    }
  ]);
});
```

## Running the sample

```bash
DEBUG=express,hapi JWKS_HOST=https://my-authz-server AUDIENCE=urn:my-resource-server ISSUER=https://my-authz-server/ node server.js
```

> Tip: You can use Auth0 to test this.

## How does this work?

When you have the sample running you'll need to get a token from your Authorization Server, which will look like this:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlJrSTVNakk1T1VZNU9EYzFOMFE0UXpNME9VWXpOa1ZHTVRKRE9VRXpRa0ZDT1RVM05qRTJSZyJ9.eyJpc3MiOiJodHRwczovL3NhbmRyaW5vLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1NjMyNTAxZjQ2OGYwZjE3NTZmNGNhYjAiLCJhdWQiOiJQN2JhQnRTc3JmQlhPY3A5bHlsMUZEZVh0ZmFKUzRyViIsImV4cCI6MTQ2ODk2NDkyNiwiaWF0IjoxNDY4OTI4OTI2fQ.NaNeRSDCNu522u4hcVhV65plQOiGPStgSzVW4vR0liZYQBlZ_3OKqCmHXsu28NwVHW7_KfVgOz4m3BK6eMDZk50dAKf9LQzHhiG8acZLzm5bNMU3iobSAJdRhweRht544ZJkzJ-scS1fyI4gaPS5aD3SaLRYWR0Xsb6N1HU86trnbn-XSYSspNqzIUeJjduEpPwC53V8E2r1WZXbqEHwM9_BGEeNTQ8X9NqCUvbQtnylgYR3mfJRL14JsCWNFmmamgNNHAI0uAJo84mu_03I25eVuCK0VYStLPd0XFEyMVFpk48Bg9KNWLMZ7OUGTB_uv_1u19wKYtqeTbt9m1YcPMQ
```

If you then decode this token (using [jwt.io](https://jwt.io)), you'll see the following header:

```json
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg"
}
```

Using this `kid` we will try to find the right signing key in the signing keys provided by the JWKS endpoint you configured.

You can then call the sample application like this:

```js
var request = require("request");

var options = {
  method: 'GET',
  url: 'http://localhost:4001/me',
  headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI...' }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

A few things will happen now:

 1. `hapi-auth-jwt2` will decode the token and pass the request and the decoded token to `jwksRsa.hapiJwt2Key`
 2. `jwks-rsa` will then download all signing keys from the JWKS endpoint and see if a one of the signing keys matches the `kid` in the header of the JWT.
   a. If none of the signing keys match the incoming `kid`, an error will be thrown
   b. If we have a match, we will pass the right signing key to `hapi-auth-jwt2`
 3. `hapi-auth-jwt2` will the continue its own logic to validate the signature of the token, the expiration, audience, issuer, ...

If you repeat this call a few times you'll see in the console output that we're not calling the JWKS endpoint anymore, because caching has been enabled.

If you then make multiple calls with a `kid` that is not defined in the JWKS endpoint, you'll see that rate limiting will kick in.
