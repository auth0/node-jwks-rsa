const http = require('http');
const https = require('https');
const urlUtil = require('url');

module.exports.default =  (options) => {
  if (options.fetcher) {
    return options.fetcher(options.uri);
  }

  return new Promise((resolve, reject) => {
    const {
      hostname,
      path,
      port,
      protocol
    } = urlUtil.parse(options.uri);

    const requestOptions = {
      hostname,
      path,
      port,
      method: 'GET',
      ...(options.headers && { headers: { ...options.headers } }),
      ...(options.timeout && { timeout: options.timeout }),
      ...(options.agent && { agent: options.agent })
    };

    const httpRequestLib = protocol === 'https:' ? https : http;
    httpRequestLib.request(requestOptions, (res) => {
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const errorMsg = res.body && (res.body.message || res.body) || res.statusMessage || `Http Error ${res.statusCode}`;
          reject({ errorMsg });
        } else {
          try {
            resolve(rawData && JSON.parse(rawData));
          } catch (error) {
            reject(error);
          }
        }
      });
    })
      .on('error', (e) => reject(e))
      .end();
  });
};
