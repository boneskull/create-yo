#!/usr/bin/env node

'use strict';

const path = require('path');
const globalDirs = require('global-dirs');
const importFrom = require('import-from');
const npx = importFrom(path.join(globalDirs.npm.packages, 'npm'), 'libnpx');
const symbols = require('log-symbols');
const bold = require('ansi-bold');

/**
 * Invokes `npx` with `--package yo --package generator-generatorName -- yo generatorName`
 *
 * @public
 * @param {string[]} [argv] - Args to use, or copy of `process.argv` by default
 * @param {string} [npmPath] - Absolute path to `npm-cli.js`
 * @returns {Promise<void>} When finished
 */
async function create(
  argv = process.argv.slice(),
  npmPath = path.join(globalDirs.npm.binaries, 'npm')
) {
  if (argv.length < 3) {
    throw new Error(
      `specify a generator to run via ${bold(
        'npm init yo <generator>'
      )}. See list: http://yeoman.io/generators/`
    );
  }

  const [generator, subgenerator] = argv.pop().split(':');
  const generatorPackage = packageName(generator);
  const generatorName = [
    generatorPackage.replace(/generator-/, ''),
    subgenerator
  ]
    .filter(Boolean)
    .join(':');

  return npx(
    npx.parseArgs(
      [
        ...argv,
        '--package',
        'yo',
        '--package',
        generatorPackage,
        '--',
        'yo',
        generatorName
      ],
      npmPath
    )
  );
}

(async function() {
  if (require.main === module) {
    try {
      await create();
      console.error(`${symbols.success} create-yo ok!`);
    } catch (err) {
      console.error(`${symbols.error} create-yo errored:\n\n${err}`);
      process.exit(1);
    }
  }
})();

exports.create = create;

/**
 * Get package name for given generator.
 *
 * @private
 * @param {string} generator
 * @returns {string} package name
 *
 * @example
 * ```js
 * generatorName(`license`) // => `generator-license`
 * generatorName(`@dizmo/dizmo`) // => `@dizmo/generator-dizmo`
 * ```
 */
function packageName(generator) {
  if (/^@[^/]+\//.test(generator)) {
    return generator.replace(/^@([^/]+)\/(generator-)?/, '@$1/generator-');
  }

  return generator.replace(/^(generator-)?/, 'generator-');
}
