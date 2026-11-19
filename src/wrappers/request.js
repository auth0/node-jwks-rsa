const http = require('http');
const https = require('https');
const ArgumentError = require('../errors/ArgumentError');

const MAX_REDIRECTS = 10;

module.exports.default =  (options) => {
  if (options.fetcher) {
    return options.fetcher(options.uri);
  }

  return new Promise((resolve, reject) => {
    const makeRequest = (uri, redirectCount) => {
      let url;
      try {
        url = new URL(uri);
      } catch (err) {
        return reject(new ArgumentError('Invalid JWKS URI: The provided URI is not a valid URL.'));
      }
      const { hostname, port, protocol, pathname, search } = url;
      const path = pathname + search;

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
      const httpRequest = httpRequestLib.request(requestOptions, (res) => {
        if (options.followRedirects && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Discard the body of the redirect response to free up the socket.
          res.resume();

          if (redirectCount >= MAX_REDIRECTS) {
            return reject({ errorMsg: `Maximum number of redirects (${MAX_REDIRECTS}) exceeded` });
          }

          // Resolve the location against the current url to support relative redirects.
          return makeRequest(new URL(res.headers.location, url).toString(), redirectCount + 1);
        }

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
      });

      httpRequest
        .on('timeout', () => httpRequest.destroy())
        .on('error', (e) => reject(e))
        .end();
    };

    makeRequest(options.uri, 0);
  });
};
