export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
};

function prepadSigned(hexStr) {
  const msb = hexStr[0];
  if (msb < '0' || msb > '7') {
    return `00${hexStr}`;
  }
  return hexStr;
}

function toHex(number) {
  const nstr = number.toString(16);
  if (nstr.length % 2) {
    return `0${nstr}`;
  }
  return nstr;
}

function encodeLengthHex(n) {
  if (n <= 127) {
    return toHex(n);
  }
  const nHex = toHex(n);
  const lengthOfLengthByte = 128 + nHex.length / 2;
  return toHex(lengthOfLengthByte) + nHex;
}

/*
 * Source: http://stackoverflow.com/questions/18835132/xml-to-pem-in-node-js
 */
export function rsaPublicKeyToPEM(modulusB64, exponentB64) {
  const modulus = new Buffer(modulusB64, 'base64');
  const exponent = new Buffer(exponentB64, 'base64');
  const modulusHex = prepadSigned(modulus.toString('hex'));
  const exponentHex = prepadSigned(exponent.toString('hex'));
  const modlen = modulusHex.length / 2;
  const explen = exponentHex.length / 2;

  const encodedModlen = encodeLengthHex(modlen);
  const encodedExplen = encodeLengthHex(explen);
  const encodedPubkey = '30' +
    encodeLengthHex(modlen + explen + encodedModlen.length / 2 + encodedExplen.length / 2 + 2) +
    '02' + encodedModlen + modulusHex +
    '02' + encodedExplen + exponentHex;

  const der = new Buffer(encodedPubkey, 'hex')
    .toString('base64');

  let pem = '-----BEGIN RSA PUBLIC KEY-----\n';
  pem += `${der.match(/.{1,64}/g).join('\n')}`;
  pem += '\n-----END RSA PUBLIC KEY-----\n';
  return pem;
};
