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

import http from '@ohos.net.http';
import prompt from '@ohos.prompt';

export class Request{
  request(options){
    return new Promise((resolve, reject) => {
      var keysResult = null
      if (options.fetcher) {
        return options.fetcher(options.uri);
      }
      let httpRequest = http.createHttp();
      let promise  = httpRequest.request(options.uri,
        {
          method: http.RequestMethod.GET, // 可选，默认为http.RequestMethod.GET
          header: options.requestHeaders,
          connectTimeout: options.timeout, // 可选，默认为60000ms
          readTimeout: options.timeout, // 可选，默认为60000ms
        }
      );
      promise.then((data)=> {
        // data.result为HTTP响应内容，可根据业务需要进行解析
        keysResult = JSON.parse((String)(data.result))
        resolve(keysResult)
      }).catch((err) => {
        console.error('http error:' + JSON.stringify(err));
        prompt.showToast({
          message: '网络错误: ' + JSON.stringify(err),
          duration: 1000
        })
      }).finally(() => {
        httpRequest.destroy();
      });
    })
  }
}

