import axios from 'axios';
import { expect } from 'chai';

import request from '../src/wrappers/request';

describe('Request wrapper tests', () => {
  
  const uri = 'https://foo/bar';
  const originalAxiosRequest = axios.request;
  const mockedAxiosRequest = (options) => {
    return Promise.resolve(options);
  };
  before(() => {
    axios.request = mockedAxiosRequest;
  });

  after(() => {
    axios.request = originalAxiosRequest;
  });

  describe('default export', () => {
    describe('should pass through strictSSL option properly', () => {
      it('should create agentOptions if strictSSL === true', (done) => {
        request({ uri, strictSSL: true }, (err, options) => {
          expect(options.httpsAgent).to.be.defined;
          expect(options.httpsAgent.options.rejectUnauthorized).to.be.true;
          done(err);
        });
      });

      it('should create agentOptions if strictSSL === false', (done) => {
        request({ uri, strictSSL: false }, (err, options) => {
          expect(options.httpsAgent).to.be.defined;
          expect(options.httpsAgent.options.rejectUnauthorized).to.be.false;
          done(err);
        });
      });

      it('should not create agentOptions if strictSSL === undefined', (done) => {
        request({ uri }, (err, options) => {
          expect(options.httpsAgent).to.be.undefined;
          done(err);
        });
      });
    });
  });
});
