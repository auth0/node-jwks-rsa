/*  The MIT License (MIT)
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
import HashMap from '@ohos.util.HashMap';

let hashMap = new HashMap();
let hashMapInformation = new HashMap();
export function cacheWrapper(client, { cacheMaxEntries = 5, cacheMaxAge = 600000 }) {
    console.info(`Configured caching of signing keys. Max: ${cacheMaxEntries} / Age: ${cacheMaxAge}`)
    const getSigningKey = client.getSigningKey.bind(client)

    return async(kid)=>{
        handleHashMapInformation(cacheMaxAge)
        if(hashMap.hasKey(kid)) {
            hashMapInformation.replace(kid, Date.now())
            return hashMap.get(kid)
        } else {
            cacheMaxEntriesControl(cacheMaxEntries)
            const singingKey = await getSigningKey(kid)
            hashMap.set(kid, singingKey)
            hashMapInformation.set(kid, Date.now())
            return singingKey
        }
    }
}

//Expiration of processing validity
 function handleHashMapInformation(cacheMaxAge){
     //cacheMaxEntries
     if(hashMapInformation.length > 0) {
         let hashMapOverdue = new HashMap();
         let nowTime = Date.now()
         let keys  = hashMapInformation.keys()
         let key = keys.next().value;
         while(key != undefined) {
             //cacheMaxAge
             if((nowTime - hashMapInformation.get(key)) > cacheMaxAge) {
                 hashMapOverdue.set(key, hashMap.get(key))
             }
             key = keys.next().value;
         }
         let hashMapOverdueKeys = hashMapOverdue.keys()
         let hashMapOverdueKey = hashMapOverdueKeys.next().value
         while(hashMapOverdueKey != undefined){
             if(hashMap.hasKey(hashMapOverdueKey)) {
                 hashMap.remove(hashMapOverdueKey)
                 hashMapInformation.remove(hashMapOverdueKey)
             }
             hashMapOverdueKey = hashMapOverdueKeys.next().value
         }
     }
}

//Exceeds the maximum number
function cacheMaxEntriesControl(cacheMaxEntries){
    if(hashMapInformation.length >= cacheMaxEntries){
        let nowTime = Date.now()
        let tempValue = nowTime
        let tempKey = ""
        let keys  = hashMapInformation.keys()
        let key = keys.next().value;
        while(key != undefined) {
            //cacheMaxAge
            if(hashMapInformation.get(key) < tempValue) {
                tempValue = hashMapInformation.get(key)
                tempKey = key
            }
            key = keys.next().value;
        }
        hashMapInformation.remove(tempKey)
        hashMap.remove(tempKey)
    }
}


