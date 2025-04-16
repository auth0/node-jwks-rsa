/**
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2021 Huawei Device Co., Ltd.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */
import cryptoFramework from '@ohos.security.cryptoFramework';
import SigningKeyNotFoundError from '../common/errors/SigningKeyNotFoundError'

import buffer from '@ohos.buffer';

const ALGORITHM_RSA = "RSA";
const ALGORITHM_RSA2048 = "RSA2048";
const ALGORITHM_ELLIPTIC_CURVE = "EC";
const ALGORITHM_ECC256 = "ECC256";
const ALGORITHM_ECC384 = "ECC384";
const ALGORITHM_ECC512 = "ECC512";
const ELLIPTIC_CURVE_TYPE_P256 = "P-256";
const ELLIPTIC_CURVE_TYPE_P384 = "P-384";
const ELLIPTIC_CURVE_TYPE_P512 = "P-512";

export function retrieveSigningKeys(keys) {

    return keys.map((key) => {
        return {
            kid: key.kid,
            algorithm: key.alg,
            type: key.kty,
            usage: key.use,
            x5u: key.x5u,
            x5c: key.x5c,
            x5t: key.x5t,
            async getPublicKey() {
                return await convertKey(key);
            }
        };
    });
    return keys
};

function base64ToBigNum(value){
 const buf = buffer.from(value,'base64');
 return "0x"+ buf.toString('hex')
}
// Compare the RSA public key specifications with the expected values.
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
function genEccCommonSpec(p,x,y,a,b,n) {
  let fieldFp = {
    fieldType: "Fp",
    p: BigInt(p)
  }

let G = {
    x: BigInt(x),
    y: BigInt(y)
}

let eccCommonSpec= {
    algName: "ECC",
    specType: cryptoFramework.AsyKeySpecType.COMMON_PARAMS_SPEC,
    field: fieldFp,
    a: BigInt(a),
    b: BigInt(b),
    g: G,
    n: BigInt(n),
    h: 1
}
return eccCommonSpec;
}

async function convertKey(key) {
    console.info("jwks_rsa converkey:"+JSON.stringify(key))
    var asyKeyGenerator;
    switch(key.kty) {
        case ALGORITHM_RSA:
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
            asyKeyGenerator = cryptoFramework.createAsyKeyGeneratorBySpec(rsaSpec);
            const  pubKey = await asyKeyGenerator.generatePubKey()
            let nBN = pubKey.getAsyKeySpec(cryptoFramework.AsyKeySpecItem.RSA_N_BN);
            let eBN = pubKey.getAsyKeySpec(cryptoFramework.AsyKeySpecItem.RSA_PK_BN);
            if (compareRsaPubKeyBySpec(rsaSpec, nBN, eBN) != true) {
                console.error("jwks_rsa error pub key big number")
            } else {
                console.info("jwks_rsa n, e in the pubKey are same as the spec.");
                return pubKey;
            }
            break;
        case ALGORITHM_ELLIPTIC_CURVE:
            let x = buffer.from(key.x,'base64');
            let y = buffer.from(key.y,'base64');
            let p = buffer.from(key.p,'base64');
            let a = buffer.from(key.a,'base64');
            let b = buffer.from(key.b,'base64');
            let cn = buffer.from(key.n,'base64');

            let xN = base64ToBigNum(x);
            let yN = base64ToBigNum(y);
            let pN = base64ToBigNum(p);
            let aN = base64ToBigNum(a);
            let cbN = base64ToBigNum(b);
            let nN = base64ToBigNum(cn);
            var eccSpec = genEccCommonSpec(pN,xN,yN,aN,cbN,nN);
            asyKeyGenerator = cryptoFramework.createAsyKeyGeneratorBySpec(eccSpec);
            const  eccPubKey = await asyKeyGenerator.generatePubKey();
            return eccPubKey;
        default:
            throw new SigningKeyNotFoundError("The key type of " + key.kty + " is not supported");
    }
}



