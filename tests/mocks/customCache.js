export default class CustomCache {
  constructor(keys = []) {
    this.keys = keys;
  }

  get(kid, getSigningKey) {
    const key = this.has(kid);
    if (key) { return Promise.resolve(key); }

    return new Promise((resolve, reject) => {
      getSigningKey(kid, (err, key) => {
        if (err) { return reject(err); }

        this.set(key);
        return resolve(key);
      });
    });
  }
  has(kid) {
    return this.keys.find(k => k.kid === kid);
  }
  set(key) {
    return this.keys.push(key);
  }
}
