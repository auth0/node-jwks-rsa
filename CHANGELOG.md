# Changelog

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
