# jwks-rsa - Koa Example

The `jwks-rsa` library provides a small helper that makes it easy to configure `koa-jwt` with the `RS256` algorithm. Using `koaJwtSecret` you can generate a key provider that will provide the right signing key to `koa-jwt` based on the `kid` in the JWT header.

```js
const Koa = require('koa');
const Router = require('koa-router');
const jwt = require('koa-jwt');
const jwksRsa = require('jwks-rsa');

...

// Start the server.
const app = new Koa();

app.use(jwt({
  secret: jwksRsa.koaJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 2,
    jwksUri: `${jwksHost}/.well-known/jwks.json`
  }),
  audience,
  issuer,
  algorithms: [ 'RS256' ]
}));

const router = new Router();

router.get('/me', ctx => {
  ctx.body = ctx.state.user
});

app.use(router.middleware());

// Start the server.
const port = process.env.PORT || 4001;
app.listen(port);
```

## Running the sample

```bash
DEBUG=koa,koa-jwt JWKS_HOST=https://my-authz-server AUDIENCE=urn:my-resource-server ISSUER=https://my-authz-server/ node server.js
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

Using this `kid` we will try to find the right signing key in the singing keys provided by the JWKS endpoint you configured.

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

 1. `koa-jwt` will decode the token and pass the request and the decoded token to `jwksRsa.koaJwtSecret`
 2. `jwks-rsa` will then download all signing keys from the JWKS endpoint and see if a one of the signing keys matches the `kid` in the header of the JWT.
   a. If none of the signing keys match the incoming `kid`, an error will be thrown
   b. If we have a match, we will pass the right signing key to `koa-jwt`, otherwise throw
 3. `koa-jwt` will the continue its own logic to validate the signature of the token, the expiration, audience, issuer, ...

If you repeat this call a few times you'll see in the console output that we're not calling the JWKS endpoint anymore, because caching has been enabled.

If you then make multiple calls with a `kid` that is not defined in the JWKS endpoint, you'll see that rate limiting will kick in.
