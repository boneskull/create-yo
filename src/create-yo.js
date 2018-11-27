#!/usr/bin/env node

'use strict';

const path = require('path');
const globalDirs = require('global-dirs');
const importFrom = require('import-from');
const npx = importFrom(path.join(globalDirs.npm.packages, 'npm'), 'libnpx');
const symbols = require('log-symbols');
const bold = require('ansi-bold');

const PREFIX = 'generator-';

/**
 * Invokes `npx` with `--package generator-generatorName yo -- generatorName`
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

  let generator = argv.pop();

  let generatorPackage = generator.startsWith(PREFIX)
    ? generator
    : `${PREFIX}${generator}`;
  let generatorName = generatorPackage.slice(PREFIX.length);

  // handle subgenerators
  generatorPackage = generatorPackage.split(':').shift();
  return npx(
    npx.parseArgs(
      argv.concat('--package', generatorPackage, 'yo', '--', generatorName),
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
