import http from 'http';
import https from 'https';
import url from 'url';
import httpProxyAgent from 'https-proxy-agent';
import httpsProxyAgent from 'https-proxy-agent';
import { request } from 'axios';

export default function(options, cb) {
  const requestOptions = {
    url: options.uri,
    headers: options.headers,
    timeout: options.timeout
  };

  if (options.proxy || options.agentOptions || options.strictSSL != undefined) {
    const agentOptions = {
      ...(options.strictSSL != undefined) && { rejectUnauthorized: options.strictSSL },
      ...(options.headers && { headers: options.headers }),
      ...options.agentOptions
    };

    if (options.proxy) {
      // Axios proxy workaround: https://github.com/axios/axios/issues/2072
      const proxy = url.parse(options.proxy);
      
      requestOptions.proxy = false; //proxyParsed
      const proxyAgentOptions = { ...agentOptions, ...proxy };
      requestOptions.httpAgent = new httpProxyAgent(proxyAgentOptions);
      requestOptions.httpsAgent = new httpsProxyAgent(proxyAgentOptions);
    } else {
      requestOptions.httpAgent = new http.Agent(agentOptions);
      requestOptions.httpsAgent = new https.Agent(agentOptions);
    }
  }

  request(requestOptions)
    .then(response => cb(null, response))
    .catch(err => cb(err));
}
