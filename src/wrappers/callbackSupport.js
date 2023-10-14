/** @typedef {import('../JwksClient.js').JwksClient} JwksClient */

import { callbackify } from 'node:util';

/** @param {JwksClient} client */
export const callbackSupport = (client) => {
  const getSigningKey = client.getSigningKey.bind(client);

  return (kid, cb) => {
    if (cb) {
      const callbackFunc = callbackify(getSigningKey);
      return callbackFunc(kid, cb);
    }

    return getSigningKey(kid);
  };
};
