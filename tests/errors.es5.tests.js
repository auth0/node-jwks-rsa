import { expect } from 'chai';

import { ArgumentError, JwksError, JwksRateLimitError, SigningKeyNotFoundError } from '../src/index.js';

describe('Errors', () => {
  describe('#ArgumentError', () => {
    it('should be exposed', () => {
      expect(ArgumentError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new ArgumentError('foo');
      expect(err.name).to.equal('ArgumentError');
    });
  });

  describe('#JwksError', () => {
    it('should be exposed', () => {
      expect(JwksError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new JwksError('foo');
      expect(err.name).to.equal('JwksError');
    });
  });

  describe('#JwksRateLimitError', () => {
    it('should be exposed', () => {
      expect(JwksRateLimitError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new JwksRateLimitError('foo');
      expect(err.name).to.equal('JwksRateLimitError');
    });
  });

  describe('#SigningKeyNotFoundError', () => {
    it('should be exposed', () => {
      expect(SigningKeyNotFoundError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new SigningKeyNotFoundError('foo');
      expect(err.name).to.equal('SigningKeyNotFoundError');
    });
  });
});
