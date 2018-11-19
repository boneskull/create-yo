'use strict';

const expect = require('unexpected').clone();
expect.use(require('unexpected-sinon'));
const sinon = require('sinon');
const rewiremock = require('rewiremock/node');
const {parseArgs} = require('libnpx');
const {exec} = require('child_process');

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
        which: r
          .with({
            sync: sandbox.stub().returns('/path/to/npm')
          })
          .directChildOnly(),
        libnpx: r.by(() => libnpx)
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

      it('should use `which` to find one', async function() {
        await create(['/path/to/node', '/path/to/create-yo', 'some-generator']);
        expect(libnpx, 'to have a call satisfying', {
          args: [
            {
              package: ['generator-some-generator@latest'],
              cmdOpts: ['--', 'some-generator'],
              npm: '/path/to/npm'
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
              package: ['generator-some-generator@latest'],
              cmdOpts: ['--', 'some-generator:subgenerator'],
              npm: '/path/to/npm'
            }
          ]
        });
      });
    });
  });
});
