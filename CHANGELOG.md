# Changelog

## [1.8.1] - (2020-06-18)

**Fixed**
- Fix #139 strictSsl: false option being ignored [\#146](https://github.com/auth0/node-jwks-rsa/pull/146) ([kopancek](https://github.com/kopancek))

**Security**
- Update dependencies to latest [\#147](https://github.com/auth0/node-jwks-rsa/pull/147) ([lbalmaceda](https://github.com/lbalmaceda))

## [1.8.0] - (2020-04-12)

**Added**
- Added timeout with default value of 30s [\#132](https://github.com/auth0/node-jwks-rsa/pull/132) ([Cooke](https://github.com/Cooke))

**Changed**
- Migrate from Deprecated Request Lib [\#135](https://github.com/auth0/node-jwks-rsa/pull/135) ([davidpatrick](https://github.com/davidpatrick))

**Fixed**
- Allow JWT to not contain a "kid" value[\#55](https://github.com/auth0/node-jwks-rsa/pull/55) ([dejan9393](https://github.com/dejan9393))

## [1.7.0] - (2020-02-18)
This release includes a change to the default caching mechanism.  Caching is on now by default, with the decrease of the default time of 10hours to 10minutes.  This change introduces better support for signing key rotation.

**Added**
- Add proxy option to jwksClient [\#125](https://github.com/auth0/node-jwks-rsa/pull/125) ([Ogdentrod](https://github.com/Ogdentrod))

**Changed**
- [SDK-1221] Modify Cache Defaults [\#123](https://github.com/auth0/node-jwks-rsa/pull/123) ([davidpatrick](https://github.com/davidpatrick))

**Fixed**
- Add Linter step to CI [\#129](https://github.com/auth0/node-jwks-rsa/pull/129) ([davidpatrick](https://github.com/davidpatrick))
- Send the explicit commit SHA to Codecov [\#128](https://github.com/auth0/node-jwks-rsa/pull/128) ([lbalmaceda](https://github.com/lbalmaceda))

## [1.6.2] - (2020-01-21)
This patch release includes an alias for accessing the public key of a given JSON Web Key (JWK). This is in response to an unintended breaking change that was introduced as part of the last Typescript definitions change, included in the release with version `1.6.0`. 

Now, no matter what the public key algorithm is, you can obtain it like this:

```js
client.getSigningKey(kid, (err, jwk) => {
  const publicKey = jwk.getPublicKey();
});
```

**Fixed**
- Add alias for obtaining the public key [\#119](https://github.com/auth0/node-jwks-rsa/pull/119) ([lbalmaceda](https://github.com/lbalmaceda))
- Handling case when Jwk doesn't have 'use' parameter [\#116](https://github.com/auth0/node-jwks-rsa/pull/116) ([manpreet-compro](https://github.com/manpreet-compro))

## [1.6.1] - (2020-01-13)

**Changed**

- NPM dependencies update [\#112](https://github.com/auth0/node-jwks-rsa/pull/112) ([ecasilla](https://github.com/ecasilla))
- Update lru-memoizer to 2.0.1 [\#106](https://github.com/auth0/node-jwks-rsa/pull/106) ([sobil](https://github.com/sobil))

## [1.6.0] - (2019-07-09)

**Added**

- Add `agentOptions` to customize `request` [TLS/SSL options](https://www.npmjs.com/package/request#using-optionsagentoptions). https://github.com/auth0/node-jwks-rsa/pull/84

## [1.5.1] - (2019-05-21)

**Changed**

- Now includes the jsonwebtoken as a runtime dependency not dev to avoid breaks with 1.5.0 installs
- Various dependencies in both the library and samples updated

## [1.5.0] - (2019-05-09)

**Added**

- Integrate with passport-jwt [\#77](https://github.com/auth0/node-jwks-rsa/pull/27) ([gconnolly](https://github.com/gconnolly))

## [1.4.0] - (2019-02-07)

**Added**

- Allow custom headers in request [\#77](https://github.com/auth0/node-jwks-rsa/pull/77) ([Mutmatt](https://github.com/Mutmatt))

## [1.3.0] - (2018-06-20)

**Added**

- Adding support for hapi 17.x.x [\#38](https://github.com/auth0/node-jwks-rsa/pull/38) ([degrammer](https://github.com/degrammer))

**Fixed**

- Fixing wrong error message [\#41](https://github.com/auth0/node-jwks-rsa/pull/41) ([adematte](https://github.com/adematte))

## [1.2.1] - 2017-10-19

### Changed

- Fixed TypeScript definition

## [1.2.0] - 2017-06-27

### Added

- Koa integration

### Changed

- `ms` updated to v2.0.0
