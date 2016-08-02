import { expect } from 'chai';

const jwksRsa = require('../src');

describe('Errors', () => {
  describe('#ArgumentError', () => {
    it('should be exposed', () => {
      expect(jwksRsa.ArgumentError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new jwksRsa.ArgumentError('foo');
      expect(err.name).to.equal('ArgumentError');
    });
  });

  describe('#JwksError', () => {
    it('should be exposed', () => {
      expect(jwksRsa.JwksError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new jwksRsa.JwksError('foo');
      expect(err.name).to.equal('JwksError');
    });
  });

  describe('#JwksRateLimitError', () => {
    it('should be exposed', () => {
      expect(jwksRsa.JwksRateLimitError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new jwksRsa.JwksRateLimitError('foo');
      expect(err.name).to.equal('JwksRateLimitError');
    });
  });

  describe('#SigningKeyNotFoundError', () => {
    it('should be exposed', () => {
      expect(jwksRsa.SigningKeyNotFoundError).not.to.be.null;
    });

    it('should have correct name', () => {
      const err = new jwksRsa.SigningKeyNotFoundError('foo');
      expect(err.name).to.equal('SigningKeyNotFoundError');
    });
  });
});
