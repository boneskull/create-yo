'use strict';

const path = require('path');
const expect = require('unexpected').clone();
expect.use(require('unexpected-sinon'));
const sinon = require('sinon');
const rewiremock = require('rewiremock/node');
const globalDirs = require('global-dirs');
const importFrom = require('import-from');
const {parseArgs} = importFrom(
  path.join(globalDirs.npm.packages, 'npm'),
  'libnpx'
);

describe('create-yo', function() {
  let sandbox;

  describe('failures', function() {
    let libnpx;
    let create;

    beforeEach(function() {
      sandbox = sinon.createSandbox();
      libnpx = sandbox.spy();
      libnpx.parseArgs = parseArgs;
      rewiremock.enable();
      create = rewiremock.proxy('..', r => ({
        'global-dirs': r.by(() => ({
          npm: {
            packages: '/path/to/global/packages',
            binaries: '/path/to/global/binaries'
          }
        })),
        'import-from': r.by(() => () => libnpx)
      })).create;
    });

    afterEach(function() {
      sandbox.restore();
      rewiremock.disable();
    });

    describe('when no generator specified', function() {
      it('should fail', async function() {
        expect(
          create(['/path/to/node', '/path/to/create-yo']),
          'to be rejected with',
          /specify a generator to run/
        );
      });
    });

    describe('when no path to npm found', function() {
      beforeEach(function() {
        sandbox.stub(console, 'error');
      });

      it('should use global one', async function() {
        await create(['/path/to/node', '/path/to/create-yo', 'some-generator']);
        expect(libnpx, 'to have a call satisfying', {
          args: [
            {
              package: ['yo@latest', 'generator-some-generator@latest'],
              command: 'yo',
              cmdOpts: ['some-generator'],
              npm: '/path/to/global/binaries/npm'
            }
          ]
        });
      });
    });

    describe('when subgenerator specified', function() {
      it('should ask npx for the parent generator but use the subgenerator', async function() {
        await create([
          '/path/to/node',
          '/path/to/create-yo',
          'some-generator:subgenerator'
        ]);
        expect(libnpx, 'to have a call satisfying', {
          args: [
            {
              package: ['yo@latest', 'generator-some-generator@latest'],
              command: 'yo',
              cmdOpts: ['some-generator:subgenerator'],
              npm: '/path/to/global/binaries/npm'
            }
          ]
        });
      });
    });
  });
});
