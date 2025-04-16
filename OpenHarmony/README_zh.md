# jwks-rsa

## 简介

从 JWKS（JSON Web 密钥集）端点检索密钥来生成公钥的库，其加密方式采用了非对称公钥加密算法（RSA）和非对称椭圆曲线加密算法(ECC)。

## 下载安装

```shell
ohpm install @ohos/jwks_rsa 
```
OpenHarmony ohpm环境配置等更多内容，请参考 [如何安装OpenHarmony ohpm包](https://gitcode.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md) 。

## 使用说明
1. 初始化：实例化JwksClient和设置对应的属性

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
 
2. 获取publicKey和属性值：

  公钥加密实现是使用OH子系统的加密框架（@ohos.security.cryptoFramework）。具体实现参考(https://gitcode.com/openharmony/docs/blob/master/zh-cn/application-dev/security/CryptoArchitectureKit/crypto-rsa-asym-encrypt-decrypt-pkcs1_oaep.md) 。
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
  //根据RSA密钥对参数生成RSA密钥对
  asyKeyGenerator = cryptoFramework.createAsyKeyGeneratorBySpec(rsaSpec);
  //生成公钥实例
  const  pubKey = await asyKeyGenerator.generatePubKey()
  //获取公钥的指定参数
  let nBN = pubKey.getAsyKeySpec(cryptoFramework.AsyKeySpecItem.RSA_N_BN);
  let eBN = pubKey.getAsyKeySpec(cryptoFramework.AsyKeySpecItem.RSA_PK_BN);
  将RSA公钥规范与预期值进行比较
  if (compareRsaPubKeyBySpec(rsaSpec, nBN, eBN) != true) {
      console.error("jwks_rsa error pub key big number")
  } else {
      console.info("jwks_rsa n, e in the pubKey are same as the spec.");
      return pubKey;
  }
```

  获取publicKey和属性值
```
  let signingKey = await this.client.getSigningKey(kid)
  this.kid = signingKey.kid
  this.alg = signingKey.alg
  this.kty = signingKey.kty
  this.use = signingKey.use
  this.publicKey = await signingKey.getPublicKey()
```

## 约束与限制
在下述版本验证通过：
- DevEco Studio 版本： 4.1 Canary(4.1.3.317)

- OpenHarmony SDK:API11 (4.1.0.36)

## 目录结构

````
|---- OHOS_APP_jwks-rsa
|   |---- entry                                                # 示例代码文件夹
|   |---- jwks-rsa                                             # OHOS_APP_jwks-rsa库文件夹
|       |---- src
            |----main
                |----js
                    |----components
                        |----errors
                            |----ArgumentError.js              #错误日志
                            |----JwksError.js                  #错误日志
                            |----JwksRateLimitError.js         #错误日志
                            |----SigningKeyNotFoundError.js    #错误日志
                        |----integrations
                            |----config.js                     #支持的加密算法
                            |----express.js                    #expressJwtSecret生成秘密提供者
                            |----hapi.js                       #hapiJwtSecret生成秘密提供者
                            |----koa.js                        #koaJwtSecret生成秘密提供者
                            |----passport.js                   #passportJwtSecret生成秘密提供者
                        |----wrappers
                            |----cache.js                      #从缓存中获取密钥
                            |----callbackSupport.js            #回调方法
                            |----interceptor.js                #回调方法
                            |----rateLimit.js                  #设置请求密钥的速率
                            |----request.js                    #网路请求
                        |----JwksClient.js                     #构造方法
                        |----utils.js                          #加密算法
|   |---- README.md                                            #使用方法
|   |---- README_zh.md                                            #使用方法
````

## 关于混淆
- 代码混淆，请查看[代码混淆简介](https://docs.openharmony.cn/pages/v5.0/zh-cn/application-dev/arkts-utils/source-obfuscation.md)
- 如果希望jwks_rsa库在代码混淆过程中不会被混淆，需要在混淆规则配置文件obfuscation-rules.txt中添加相应的排除规则：

```
-keep
./oh_modules/@ohos/jwks_rsa
```

## 贡献代码

使用过程中发现任何问题都可以提 [Issue](https://gitcode.com/openharmony-tpc/openharmony_tpc_samples/issues) 给组件，当然，也非常欢迎发 [PR](https://gitcode.com/openharmony-tpc/openharmony_tpc_samples/pulls)共建 。

## 开源协议

本项目基于 [MIT License](https://gitcode.com/openharmony-tpc/openharmony_tpc_samples/blob/master/jwks-rsa/LICENSE) ，请自由地享受和参与开源。