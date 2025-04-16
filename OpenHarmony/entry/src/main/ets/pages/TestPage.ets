/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {JwksClient} from "@ohos/jwks_rsa"
import util from '@ohos.util';
import cryptoFramework from "@ohos.security.cryptoFramework";


// let that:ESObject;
class Option{
  jwksUri:string;
  requestHeaders: null | object; // Optional
  timeout:number=5000; // Defaults to 30s
  cache:boolean;
  rateLimit: boolean

  constructor(jwksUri:string,
  requestHeaders: null | object, // Optional
  timeout:number, // Defaults to 30s
  cache:boolean,
  rateLimit: boolean) {
    this.jwksUri = jwksUri;
    this.requestHeaders = requestHeaders;
    this.timeout = timeout;
    this.cache = cache;
    this.rateLimit = rateLimit;
  }
}
@Entry
@Component
struct Index {
  @State kid: string = ''
  @State alg: string = ''
  @State kty: string = ''
  @State usage: string = ''
  @State publicKey: string = ''
  private client: JwksClient|null = null;

  build() {
    Column() {
      Scroll() {
        Column({ space: 5 }) {
          Row() {
            Button($r('app.string.generate_public_key')).fontSize($r('app.string.button_font_size')).width('70%').height('70%').padding($r('app.string.margin')).onClick(() => {
              console.info("===== get publicKey start =====")
              const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
              //根据kid从秘钥集中获取对应的jwk
              this.getData(kid)
            })
          }.justifyContent(FlexAlign.Center).width('100%').height('100vp')

          Text("kid: " + this.kid)
            .fontSize($r('app.string.font_size'))
          Text("alg: " + this.alg)
            .fontSize($r('app.string.font_size'))
          Text("kty: " + this.kty)
            .fontSize($r('app.string.font_size'))
          Text("usage: " + this.usage)
            .fontSize($r('app.string.font_size'))
          Text("publicKey: " + this.publicKey)
            .fontSize($r('app.string.font_size'))
        }
        .width('100%').margin($r('app.string.margin')).alignItems(HorizontalAlign.Start).justifyContent(FlexAlign.Start)
      }
    }.height('100%').justifyContent(FlexAlign.Start).alignItems(HorizontalAlign.Start)
  }

  aboutToAppear() {
    // that = this;
    let option: Option = new Option('https://sandrino.auth0.com/.well-known/jwks.json',null,5000,false,true)
    this.client = new JwksClient(option);
  }

  async getData(kid:string) {


    if(this.client != null){
      let signingKey: Single = await this.client.getSigningKey(kid)
      console.info("jwks_rsa signingKey:"+JSON.stringify(signingKey))
      this.kid = signingKey.kid
      this.alg = signingKey.algorithm
      this.kty = signingKey.type
      this.usage = signingKey.usage
      let pubKey:cryptoFramework.PubKey | undefined = await signingKey.getPublicKey()
      let publicData:Uint8Array | undefined  = pubKey?.getEncoded().data;
      console.info("jwks_rsa public key encode  = " + publicData)
      let base64:util.Base64Helper = new util.Base64Helper();
      this.publicKey = base64.encodeToStringSync(publicData);
      console.info("jwks_rsa publicKey = " + this.publicKey)
    }

  }
}

class Single{
  kid: string = "";
  algorithm: string = "";
  type:string = "";
  usage: string = "";
  x5u: undefined | string | string[] = undefined;
  x5c: undefined | string | string[] = undefined;
  x5t: undefined | string | string[] = undefined;
  getPublicKey():cryptoFramework.PubKey | undefined {
    return undefined
  }
}