const expect = require('unexpected').clone();
expect.use(require('unexpected-sinon'));
const sinon = require('sinon');
const rewiremock = require('rewiremock/node');
const {parseArgs} = require('libnpx');
describe('create-yo', function() {
  let sandbox;

  describe('failures', function() {
    let spy;
    let create;

    beforeEach(function() {
      sandbox = sinon.createSandbox();
      spy = sandbox.spy();
      spy.parseArgs = parseArgs;
      rewiremock.enable();
      create = rewiremock.proxy('..', r => ({
        which: r
          .with({
            sync: sandbox.stub().returns('/path/to/npm')
          })
          .directChildOnly(),
        libnpx: r.by(() => spy)
      })).create;
    });

    afterEach(function() {
      sandbox.restore();
      rewiremock.disable();
    });

    describe('when no generator specified', function() {
      it('should fail', function() {
        expect(
          () => {
            create(['/path/to/node', '/path/to/create-yo']);
          },
          'to throw',
          /specify a generator to run/
        );
      });
    });

    describe('when no path to npm found', function() {
      it('should use `which` to find one', function() {
        create(['/path/to/node', '/path/to/create-yo', 'some-generator'], '');
        expect(spy, 'to have a call satisfying', {
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
  });
});
