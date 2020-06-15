import http from 'http';
import https from 'https';
import urlUtil from 'url';
import { request } from 'axios';

export default function(options, cb) {
  const requestOptions = {
    baseURL: options.uri,
    headers: options.headers,
    timeout: options.timeout
  };

  if (options.proxy) {
    const proxy = urlUtil.parse(options.proxy);
    const [ username, password ] = proxy.auth.split(':');

    requestOptions.proxy = {
      host: proxy.hostname,
      port: proxy.port,
      auth: { username, password }
    };
  } 

  if (options.agentOptions || options.strictSSL != undefined) {
    const agentOptions = {
      ...(options.strictSSL != undefined) && { rejectUnauthorized: options.strictSSL },
      ...options.agentOptions
    };
    requestOptions.httpAgent = new http.Agent(agentOptions);
    requestOptions.httpsAgent = new https.Agent(agentOptions);
  }

  request(requestOptions)
    .then(response => cb(null, response))
    .catch(err => cb(err));
};
