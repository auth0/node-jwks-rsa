# Change Log

## [v3.2.1](https://github.com/auth0/node-jwks-rsa/tree/v3.2.1) (2026-01-15)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v3.2.0...v3.2.1)

**Added**
- docs: Add Ask DeepWiki badge to README [\#445](https://github.com/auth0/node-jwks-rsa/pull/445) ([arpit-jn](https://github.com/arpit-jn))

**Fixed**
- fix: Migrate to WHATWG URL API from node's core url [\#465](https://github.com/auth0/node-jwks-rsa/pull/465) ([cschetan77](https://github.com/cschetan77))
- fix: Moving @types/express to dev and re generating package lock [\#464](https://github.com/auth0/node-jwks-rsa/pull/464) ([cschetan77](https://github.com/cschetan77))

## [v3.2.0](https://github.com/auth0/node-jwks-rsa/tree/v3.2.0) (2025-03-18)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v3.1.0...v3.2.0)

**Changed**
- Bump express from 4.18.2 to 4.19.2 [\#408](https://github.com/auth0/node-jwks-rsa/pull/408) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump braces from 3.0.2 to 3.0.3 [\#413](https://github.com/auth0/node-jwks-rsa/pull/413) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump jose from 4.15.4 to 4.15.5 [\#402](https://github.com/auth0/node-jwks-rsa/pull/402) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump codecov/codecov-action from 3.1.4 to 3.1.5 [\#396](https://github.com/auth0/node-jwks-rsa/pull/396) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump actions/cache from 3 to 4 [\#395](https://github.com/auth0/node-jwks-rsa/pull/395) ([dependabot[bot]](https://github.com/apps/dependabot))
- Update automated release process to latest version [\#391](https://github.com/auth0/node-jwks-rsa/pull/391) ([frederikprijck](https://github.com/frederikprijck))
- Bump actions/github-script from 6 to 7 [\#387](https://github.com/auth0/node-jwks-rsa/pull/387) ([dependabot[bot]](https://github.com/apps/dependabot))
- chore(deps): Update Lockfile [\#386](https://github.com/auth0/node-jwks-rsa/pull/386) ([evansims](https://github.com/evansims))
- Bump actions/setup-node from 3 to 4 [\#382](https://github.com/auth0/node-jwks-rsa/pull/382) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump @babel/traverse from 7.10.1 to 7.23.2 [\#381](https://github.com/auth0/node-jwks-rsa/pull/381) ([dependabot[bot]](https://github.com/apps/dependabot))

**Fixed**
- [Fix] Change type of unused req param to unknown to resolve type conflicts [\#394](https://github.com/auth0/node-jwks-rsa/pull/394) ([zackdotcomputer](https://github.com/zackdotcomputer))
- fix(compat): ensure WebCryptoAPI runtime imported keys are re-exportable [\#409](https://github.com/auth0/node-jwks-rsa/pull/409) ([panva](https://github.com/panva))
- fix: express-jwt types [\#412](https://github.com/auth0/node-jwks-rsa/pull/412) ([jfromaniello](https://github.com/jfromaniello))

## [v3.1.0](https://github.com/auth0/node-jwks-rsa/tree/v3.1.0) (2023-10-05)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v3.0.1...v3.1.0)

**Added**
- feat: resolve bun/deno compat issues [\#374](https://github.com/auth0/node-jwks-rsa/pull/374) ([panva](https://github.com/panva))

## [v3.0.1](https://github.com/auth0/node-jwks-rsa/tree/v3.0.1) (2023-01-12)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v3.0.0...v3.0.1)

**Fixed**
- update types/jsonwebtoken update v9.0.0 [\#349](https://github.com/auth0/node-jwks-rsa/pull/349) ([ToshihitoKon](https://github.com/ToshihitoKon))
- Bump jsonwebtoken from 8.5.1 to 9.0.0 [\#344](https://github.com/auth0/node-jwks-rsa/pull/344) ([dependabot[bot]](https://github.com/apps/dependabot))

## [v3.0.0](https://github.com/auth0/node-jwks-rsa/tree/v3.0.0) (2022-11-01)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.1.5...v3.0.0)

**⚠️ BREAKING CHANGES**

This release drops support for Node 10 and 12
- [major] bump jose [\#333](https://github.com/auth0/node-jwks-rsa/pull/333) ([panva](https://github.com/panva))

## [v2.1.5](https://github.com/auth0/node-jwks-rsa/tree/v2.1.5) (2022-10-10)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.1.4...v2.1.5)

**Fixed**
- Fix GetVerificationKey typing to include undefined [\#329](https://github.com/auth0/node-jwks-rsa/pull/329) ([AaronMoat](https://github.com/AaronMoat))

## [v2.1.4](https://github.com/auth0/node-jwks-rsa/tree/v2.1.4) (2022-06-07)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.1.3...v2.1.4)

**Fixed**
- Type definitions depend on jsonwebtoken [\#314](https://github.com/auth0/node-jwks-rsa/pull/314) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v2.1.3](https://github.com/auth0/node-jwks-rsa/tree/v2.1.3) (2022-05-20)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.1.2...v2.1.3)

**Fixed**
- Fix issue with ES Express import [\#310](https://github.com/auth0/node-jwks-rsa/pull/310) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [v2.1.2](https://github.com/auth0/node-jwks-rsa/tree/v2.1.2) (2022-05-12)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.1.1...v2.1.2)

**Fixed**
- fix: express build error [\#304](https://github.com/auth0/node-jwks-rsa/pull/304) ([blindperson](https://github.com/blindperson))

## [v2.1.1](https://github.com/auth0/node-jwks-rsa/tree/v2.1.1) (2022-05-06)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.1.0...v2.1.1)

**Fixed**
- fix: types-compabitility for express-jwt @ 7 [\#301](https://github.com/auth0/node-jwks-rsa/pull/301) ([carboneater](https://github.com/carboneater))

## [v2.1.0](https://github.com/auth0/node-jwks-rsa/tree/v2.1.0) (2022-04-26)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.0.5...v2.1.0)

**Added**
- add support for express-jwt@7 [\#297](https://github.com/auth0/node-jwks-rsa/pull/297) ([jfromaniello](https://github.com/jfromaniello))

**Fixed**
- fix(type): correct the wrong type of the `getSigningKey` function arg… [\#289](https://github.com/auth0/node-jwks-rsa/pull/289) ([stegano](https://github.com/stegano))

## [v2.0.5](https://github.com/auth0/node-jwks-rsa/tree/v2.0.5) (2021-10-15)
[Full Changelog](https://github.com/auth0/node-jwks-rsa/compare/v2.0.4...v2.0.5)

**Fixed**
- Destroy the request when reaches the timeout (#270) [\#271](https://github.com/auth0/node-jwks-rsa/pull/271) ([amrsalama](https://github.com/amrsalama))
- [SDK-2833] Fix issue where errors were being cached [\#268](https://github.com/auth0/node-jwks-rsa/pull/268) ([adamjmcgrath](https://github.com/adamjmcgrath))

## [2.0.4] - (2021-07-16)

**Fixed**
- [SDK-2626] getKeysInterceptor types [\#251](https://github.com/auth0/node-jwks-rsa/pull/251) ([davidpatrick](https://github.com/davidpatrick))

## [2.0.3] - (2021-04-20)

**Fixed**
- Fix retrieveSigningKeys error [\#242](https://github.com/auth0/node-jwks-rsa/pull/237) ([davidpatrick](https://github.com/davidpatrick))

**Security**
- Bump jose from 2.0.3 to 2.0.5 [\#244](https://github.com/auth0/node-jwks-rsa/pull/244) ([dependabot](https://github.com/dependabot))

## [2.0.2] - (2021-03-24)

**Fixed**
- Interceptor bind client [\#237](https://github.com/auth0/node-jwks-rsa/pull/237) ([erikfried](https://github.com/erikfried))
- Update type def for getSigningKey [\#236](https://github.com/auth0/node-jwks-rsa/pull/236) ([davidpatrick](https://github.com/davidpatrick))
- Use hostname instead of host when creating request [\#233](https://github.com/auth0/node-jwks-rsa/pull/233) ([cjlpowers](https://github.com/cjlpowers))

## [2.0.1] - (2021-03-12)
**Added**
- Callback backwards compatbility for `getSigningKey` [\#227](https://github.com/auth0/node-jwks-rsa/pull/227) ([davidpatrick](https://github.com/davidpatrick))

**Fixed**
- Fix typescript declarations for v2 [\#229](https://github.com/auth0/node-jwks-rsa/pull/229) ([davidpatrick](https://github.com/baywet))
- Fix typescript types for fetcher [\#231](https://github.com/auth0/node-jwks-rsa/pull/231) ([itajaja](https://github.com/itajaja))

## [2.0.0] - (2021-03-01)
With version 2 we have added full JWK/JWS support.  With this we have bumped the node version to minimum 10.  We have also removed Axios and exposed a `fetcher` option to allow user's to completely override how the request to the `jwksUri` endpoint is made.

### Breaking Changes
* Drops support for Node < 10
* No more callbacks, using async/await(promises)
* Removed Axios and changed the API to JwksClient

### Changes
**Added**
- Full JWK/JWS Support [\#205](https://github.com/auth0/node-jwks-rsa/pull/205) ([panva](https://github.com/panva))

**Changed**
- Simplify request wrapper [\#218](https://github.com/auth0/node-jwks-rsa/pull/218) ([davidpatrick](https://github.com/davidpatrick))
- Pins to Node Version 10,12,14 [\#212](https://github.com/auth0/node-jwks-rsa/pull/212) ([davidpatrick](https://github.com/davidpatrick))
- Migrate from callbacks to async/await [\#222](https://github.com/auth0/node-jwks-rsa/pull/222) ([davidpatrick](https://github.com/davidpatrick))

### Migration Guide from v1 to v2
#### Proxies
The proxy option has been removed from the JwksClient.  Support for it was a little spotty through Axios, and we wanted to allow users to have more control over the flow.  Now you can specify your proxy by overriding the `requestAgent` used with an [agent with built-in proxy support](https://github.com/TooTallNate/node-https-proxy-agent), or by completely overriding the request library with the `fetcher` option.

```js
// OLD
const oldClient = jwksClient({
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  proxy: 'https://username:pass@address:port'
});

// NEW
const HttpsProxyAgent = require('https-proxy-agent');
const newClient = jwksClient({
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  requestAgent: new HttpsProxyAgent('https://username:pass@address:port')
});
```

#### Request Agent Options
The library no longer gates what http(s) Agent is used, so we have removed `requestAgentOptions` and now expose the `requestAgent` option when creating a `jwksClient`.

```js
// OLD
const oldClient = jwksClient({
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  requestAgentOptions: {
    ca: fs.readFileSync(caFile)
  }
});

// NEW
const newClient = jwksClient({
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
  requestAgent: new https.Agent({
    ca: fs.readFileSync(caFile)
  })
});
```

#### Migrated Callbacks to Async/Await
The library no longer supports callbacks.  We have migrated to async/await(promises).

```js
// OLD
client.getSigningKey(kid, (err, key) => {
  const signingKey = key.getPublicKey();
});

// NEW
const key = await client.getSigningKey(kid);
const signingKey = key.getPublicKey();
```

## [1.12.3] - (2021-02-25)

**Added**
- Add alg to SigningKey types [\#220](https://github.com/auth0/node-jwks-rsa/pull/220) ([okko](https://github.com/okko))

**Fixed**

- Fix npmjs resolves [\#221](https://github.com/auth0/node-jwks-rsa/pull/221) ([adamjmcgrath](https://github.com/adamjmcgrath))
- Fix Import default Axios instance [\#216](https://github.com/auth0/node-jwks-rsa/pull/216) ([dsebastien](https://github.com/dsebastien)) 


## [1.12.2] - (2021-01-07)

**Fixed**
- Added coverage folders to .npmignore


## [1.12.1] - (2020-12-29)

**Security**
- Bump Axios to ^0.21.1 [\#208](https://github.com/auth0/node-jwks-rsa/pull/208) ([72636c](https://github.com/72636c))

## [1.12.0] - (2020-12-08)

**Added**
- Provide an alternative source for supplying keysets [\#202](https://github.com/auth0/node-jwks-rsa/pull/202) ([davidpatrick](https://github.com/davidpatrick))

**Deprecation**
We are deprecating passing in a `jwksObject` to the client for reasons laid out in [\#202](https://github.com/auth0/node-jwks-rsa/pull/202).  In order to load keys from anything other than the `jwksUri`, please use the `getKeysInterceptor`.

```js
  const client = new JwksClient({ 
    jwksUri: 'https://my-enterprise-id-provider/.well-known/jwks.json',
    getKeysInterceptor: (cb) => {
      const file = fs.readFileSync(jwksFile);
      return cb(null, file.keys);
    }
  });
```

## [1.11.0] - (2020-10-23)

**Added**
- Add ability to configure proxy with env vars [\#188](https://github.com/auth0/node-jwks-rsa/pull/188) ([lubomir-haralampiev](https://github.com/lubomir-haralampiev))

## [1.10.1] - (2020-09-24)

**Fixed**
- fix proxy agent for http [\#182](https://github.com/auth0/node-jwks-rsa/pull/182) ([NShahri](https://github.com/NShahri))
- fix dependencies for --production flag with npm [\#180](https://github.com/auth0/node-jwks-rsa/pull/180) ([alexrqs](https://github.com/alexrqs))

## [1.10.0] - (2020-09-23)

**Added**
- getSigningKeys return algorithm [\#168](https://github.com/auth0/node-jwks-rsa/pull/168) ([moander](https://github.com/moander))

**Fixed**
- Add missing async methods to Typescript type definitions [\#163](https://github.com/auth0/node-jwks-rsa/pull/163) ([mwgamble](https://github.com/mwgamble))
- Fixing proxy on Axios [\#176](https://github.com/auth0/node-jwks-rsa/pull/176) ([davidpatrick](https://github.com/davidpatrick))
- Fix caching and rateLimiting on getSigningKeyAsync [\#177](https://github.com/auth0/node-jwks-rsa/pull/177) ([davidpatrick](https://github.com/davidpatrick))

## [1.9.0] - (2020-08-18)

**Added**
- Add promisified methods to JwksClient [\#161](https://github.com/auth0/node-jwks-rsa/pull/161) ([jimmyjames](https://github.com/jimmyjames))
- Update express-jwt ^6.0.0 [\#157](https://github.com/auth0/node-jwks-rsa/pull/157) ([davidpatrick](https://github.com/davidpatrick))

**Fixed**
- Update Buffer initialization to non-deprecated method [\#154](https://github.com/auth0/node-jwks-rsa/pull/154) ([cwardcode](https://github.com/cwardcode))
- Use axios url parameter instead of baseURL [\#153](https://github.com/auth0/node-jwks-rsa/pull/153) ([novascreen](https://github.com/novascreen))

**Security**
- Bump lodash from 4.17.15 to 4.17.19 [\#152](https://github.com/auth0/node-jwks

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
