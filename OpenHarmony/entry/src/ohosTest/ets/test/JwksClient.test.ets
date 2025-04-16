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
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium'
import {JwksClient} from "@ohos/jwks_rsa"
import Option from './Option'

let jwksClient: JwksClient;
let signingKey:ESObject;

export default function JwksClientTest() {
  describe('ArtsJwksClientTest', ()=> {
      beforeAll(() => {
        console.info("===== beforeAll ======")
        let option: Option = new Option('https://sandrino.auth0.com/.well-known/jwks.json',null,5000,false,true)
        jwksClient = new JwksClient(option);
        expect(jwksClient != null).assertTrue()
      })
      afterAll(()=>{
        jwksClient == null;
      })
      it('JwksClient_Test_getKeys',0, async () => {
        expect(await jwksClient.getKeys() != null).assertTrue()
      })

      it('JwksClient_Test_getSigningKeys',0, async () => {
        expect(await jwksClient.getSigningKeys() != null).assertTrue()
      })

      it('JwksClient_Test_signingKey',0, async () => {
        const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
        signingKey = await jwksClient.getSigningKey(kid);
        expect(signingKey != null).assertTrue()
      })

      it('JwksClient_Test_kid',0, async () =>{
        expect(signingKey.kid != null).assertTrue()
      })

      it('JwksClient_Test_algorithm',0, () => {
        expect(signingKey.algorithm != null).assertTrue()
      })

      it('JwksClient_Test_type',0, () => {
        expect(signingKey.type != null).assertTrue()
      })

      it('JwksClient_Test_usage',0, () => {
        expect(signingKey.usage != null).assertTrue()
      })

      it('JwksClient_Test_getPublicKey',0, async () => {
        let publicKey:ESObject = await signingKey.getPublicKey()
        expect(publicKey != null).assertTrue()
      })
  })
}