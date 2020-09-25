import http from 'http';
import https from 'https';
import url from 'url';
import httpProxyAgent from 'http-proxy-agent';
import httpsProxyAgent from 'https-proxy-agent';
import { request } from 'axios';
import { getProxyForUrl } from 'proxy-from-env';

export default function(options, cb) {
  const requestOptions = {
    url: options.uri,
    headers: options.headers,
    timeout: options.timeout
  };

  const proxyUrl = options.proxy || getProxyForUrl(options.uri);
  if (proxyUrl || options.agentOptions || options.strictSSL != undefined) {
    const agentOptions = {
      ...(options.strictSSL != undefined) && { rejectUnauthorized: options.strictSSL },
      ...(options.headers && { headers: options.headers }),
      ...options.agentOptions
    };

    if (proxyUrl) {
      // Axios proxy workaround: https://github.com/axios/axios/issues/2072
      const proxyOptions = url.parse(proxyUrl);
      requestOptions.proxy = false; //proxyParsed
      const proxyAgentOptions = { ...agentOptions, ...proxyOptions };
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
