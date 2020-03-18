import http from 'http';
import https from 'https';
import urlUtil from 'url';

export default function(options, cb) {
  const {
    host,
    path,
    port,
    protocol
  } = urlUtil.parse(options.uri);

  const httpRequestLib = protocol === 'https:' ? https : http;
  const requestOptions = {
    host,
    path,
    port,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (options.agentOptions) {
    requestOptions.agent = new httpRequestLib.Agent(options.agentOptions);
  }

  if (!options.strictSsl) {
    requestOptions.rejectUnauthorized = false;
  }

  if (options.headers) {
    requestOptions.headers = { ...requestOptions.headers, ...options.headers };
  }

  if (options.proxy) {
    const proxy = urlUtil.parse(options.proxy);
    requestOptions.host = proxy.host;
    requestOptions.port = proxy.port;
    requestOptions.path = options.path;
    requestOptions.headers.Host = host;
  }

  httpRequestLib.request(requestOptions, (res) => {
    res.rawData = '';
    res.on('data', (chunk) => { res.rawData += chunk; });
    res.on('end', () => cb(null, res));
  }).on('error', (err) => cb(err)).end();
};
