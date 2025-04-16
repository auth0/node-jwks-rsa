# jwks-rsa

## Introduction

jwks-rsa is a library that retrieves keys from JSON Web Key Set (JWKS) endpoints to generate public keys. It uses the asymmetric public key encryption algorithm (RSA) and asymmetric elliptic curve encryption algorithm (ECC) for encryption.

## How to Install

```shell
ohpm install @ohos/jwks_rsa 
```
For details about the OpenHarmony ohpm environment configuration, see [OpenHarmony HAR](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.en.md).

## How to Use
1. Instantiate **JwksClient** and set the corresponding attributes.

 ```
this.client = new JwksClient({
    jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
    requestHeaders: {}, // Optional
    timeout: 30000, // Defaults to 30s
    cache: false,
    rateLimit: true
    });
},
```
 
2. Obtain **publicKey** and the attribute value.

  Public key encryption is implemented using the encryption framework (@ohos.security.cryptoFramework) of OpenHarmony. For details, see [Encryption and Decryption with an RSA Asymmetric Key Pair (PKCS1_OAEP)](https://gitcode.com/openharmony/docs/blob/master/en/application-dev/security/CryptoArchitectureKit/crypto-rsa-asym-encrypt-decrypt-pkcs1_oaep.md).
```
  function compareRsaPubKeyBySpec(rsaKeySpec, n, e) {
    if (typeof n === 'string' || typeof e === 'string') {
        console.error('type is string');
        return false;
    }
    if (typeof n === 'number' || typeof e === 'number') {
        console.error('type is number');
        return false;
    }
    if (rsaKeySpec.params.n != n) {
        return false;
    }
    if (rsaKeySpec.pk != e) {
        return false;
    }
    return true;
  }
  
  let n = buffer.from(key.n,'base64')
  let e = buffer.from(key.e,'base64')
  let bN = base64ToBigNum(n);
  let eN = base64ToBigNum(e);
  var commonSpec = {
      algName:"RSA",
      specType:cryptoFramework.AsyKeySpecType.COMMON_PARAMS_SPEC,
      n:BigInt(bN)
  }
  var rsaSpec = {
      algName:"RSA",
      specType:cryptoFramework.AsyKeySpecType.PUBLIC_KEY_SPEC,
      params : commonSpec,
      pk :BigInt(eN),
  }
  // Generate an RSA key pair based on the RSA key pair parameter.
  asyKeyGenerator = cryptoFramework.createAsyKeyGeneratorBySpec(rsaSpec);
  // Generate a publicKey instance.
  const  pubKey = await asyKeyGenerator.generatePubKey()
  // Obtain the specified parameters of publicKey.
  let nBN = pubKey.getAsyKeySpec(cryptoFramework.AsyKeySpecItem.RSA_N_BN);
  let eBN = pubKey.getAsyKeySpec(cryptoFramework.AsyKeySpecItem.RSA_PK_BN);
  Compare the RSA public key specifications with the expected value.
  if (compareRsaPubKeyBySpec(rsaSpec, nBN, eBN) != true) {
      console.error("jwks_rsa error pub key big number")
  } else {
      console.info("jwks_rsa n, e in the pubKey are same as the spec.");
      return pubKey;
  }
```

  Obtain publicKey and the attribute value.
```
  let signingKey = await this.client.getSigningKey(kid)
  this.kid = signingKey.kid
  this.alg = signingKey.alg
  this.kty = signingKey.kty
  this.use = signingKey.use
  this.publicKey = await signingKey.getPublicKey()
```

## Constraints
This project has been verified in the following version:
- DevEco Studio: 4.1 Canary (4.1.3.317)

- OpenHarmony SDK: API11 (4.1.0.36)

## Directory Structure

````
|---- OHOS_APP_jwks-rsa
|   |---- entry                                                # Sample code
|   |---- jwks-rsa                                             # OHOS_APP_jwks-rsa library
|       |---- src
            |----main
                |----js
                    |----components
                        |----errors
                            |----ArgumentError.js              # Error logs
                            |----JwksError.js                  # Error logs
                            |----JwksRateLimitError.js         # Error logs
                            |----SigningKeyNotFoundError.js    # Error logs
                        |----integrations
                            |----config.js                     # Encryption algorithms
                            |----express.js                    # Secret provider generation by expressJwtSecret
                            |----hapi.js                       # Secret provider generation by hapiJwtSecret
                            |----koa.js                        # Secret provider generation by koaJwtSecret
                            |----passport.js                   # Secret provider generation by passportJwtSecret
                        |----wrappers
                            |----cache.js                      # Key acquisition from the cache
                            |----callbackSupport.js            # Callbacks
                            |----interceptor.js                # Callbacks
                            |----rateLimit.js                  # Key requesting rate
                            |----request.js                    # Network requests
                        |----JwksClient.js                     # JwksClient constructor
                        |----utils.js                          # Encryption algorithms
|   |---- README.md                                            # Readme
|   |---- README_zh.md                                            # Readme
````

## About obfuscation
- Code obfuscation, please see[Code Obfuscation](https://docs.openharmony.cn/pages/v5.0/zh-cn/application-dev/arkts-utils/source-obfuscation.md)
- If you want the jwks_rsa library not to be obfuscated during code obfuscation, you need to add corresponding exclusion rules in the obfuscation rule configuration file obfuscation-rules.txt：

```
-keep
./oh_modules/@ohos/jwks_rsa
```

## How to Contribute

If you find any problem when using jwks-rsa, you can submit an [Issue](https://gitcode.com/openharmony-tpc/openharmony_tpc_samples/issues) or a [PR](https://gitcode.com/openharmony-tpc/openharmony_tpc_samples/pulls) to us.

## License

This project is licensed under the terms of the [MIT License](https://gitcode.com/openharmony-tpc/openharmony_tpc_samples/blob/master/jwks-rsa/LICENSE).
