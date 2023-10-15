import { request as httpRequestFn } from 'node:http';
import { request as httpsRequestFn } from 'node:https';
import { parse } from 'node:url';

export const request = (options) => {
  if (options.fetcher) {
    return options.fetcher(options.uri);
  }

  return new Promise((resolve, reject) => {
    const { hostname, path, port, protocol } = parse(options.uri);

    const requestOptions = {
      hostname,
      path,
      port,
      method: 'GET',
      ...(options.headers && { headers: { ...options.headers } }),
      ...(options.timeout && { timeout: options.timeout }),
      ...(options.agent && { agent: options.agent })
    };

    const requestFn = protocol === 'https:' ? httpsRequestFn : httpRequestFn;
    const httpRequest = requestFn(requestOptions, (res) => {
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const errorMsg =
            (res.body && (res.body.message || res.body)) || res.statusMessage || `Http Error ${res.statusCode}`;
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
  });
};
