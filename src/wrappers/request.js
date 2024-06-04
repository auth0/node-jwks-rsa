const urlUtil = require("url");
const fetch = require("node-fetch"); // Ensure to install node-fetch

module.exports.default = async (options) => {
  if (options.fetcher) {
    return options.fetcher(options.uri);
  }

  const { hostname, path, port, protocol } = urlUtil.parse(options.uri);
  const url = `${protocol}//${hostname}${port ? `:${port}` : ""}${path}`;

  const requestOptions = {
    method: "GET",
    headers: options.headers || {},
    agent: options.agent || undefined,
  };

  const response = await fetch(url, requestOptions);
  const rawData = await response.text();

  if (!response.ok) {
    const errorMsg = response.statusText || `Http Error ${response.status}`;
    throw { errorMsg };
  }

  return rawData ? JSON.parse(rawData) : {};
};
