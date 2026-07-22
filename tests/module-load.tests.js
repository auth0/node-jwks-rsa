const { execFileSync } = require('child_process');
const path = require('path');

describe('CommonJS module loading', () => {
  it('loads public entrypoints when synchronous ESM require is disabled', () => {
    execFileSync(
      process.execPath,
      [
        '--no-experimental-require-module',
        '-e',
        "require('./src'); require('./src/utils');"
      ],
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      }
    );
  });
});
