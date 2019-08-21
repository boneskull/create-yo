#!/usr/bin/env node

'use strict';

const path = require('path');
const globalDirs = require('global-dirs');
const importFrom = require('import-from');
const symbols = require('log-symbols');
const bold = require('ansi-bold');
const fs = require('fs');

const PREFIX = 'generator-';

function getNpxCliPathWindows() {
  // On Windows globalDirs.npm.packages can resolve to
  // "%APPDATA%\Roaming\npm\node_modules"
  // when the location of libnpx is actually
  // "%ProgramFiles%\nodejs\node_modules\npm\node_modules"

  // Find the location of the npx-cli.js script.
  // ex: "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js"
  let npxCli = require('unwrap-npm-cmd')('npx', {jsOnly: true});

  // Strip the quotes around the string.
  return npxCli.replace(/^"|"$/g, '');
}

const npx = (() => {
  try {
    return importFrom(path.join(globalDirs.npm.packages, 'npm'), 'libnpx');
  } catch (error) {
    if (process.platform !== 'win32') {
      throw error;
    }
  }

  const npxCli = getNpxCliPathWindows();
  return importFrom(npxCli, 'libnpx');
})();

function getNpmPath() {
  let npmPath = path.join(globalDirs.npm.binaries, 'npm');
  if (process.platform === 'win32' && !fs.existsSync(npmPath)) {
    let npmCli = require('unwrap-npm-cmd')('npm', {jsOnly: true});
    // Strip the quotes around the string.
    npmPath = npmCli.replace(/^"|"$/g, '');
  }
  return npmPath;
}

/**
 * Invokes `npx` with `--package yo --package generator-generatorName -- yo generatorName`
 *
 * @public
 * @param {string[]} [argv] - Args to use, or copy of `process.argv` by default
 * @param {string} [npmPath] - Absolute path to `npm-cli.js`
 * @returns {Promise<void>} When finished
 */
async function create(argv = process.argv.slice(), npmPath = getNpmPath()) {
  if (argv.length < 3) {
    throw new Error(
      `specify a generator to run via ${bold(
        'npm init yo <generator>'
      )}. See list: http://yeoman.io/generators/`
    );
  }

  let generator = argv.pop();
  let generatorPackage;
  let generatorName;
  if (generator.startsWith('@')) {
    // handle scoped packages
    generatorName = generatorPackage = generator;
  } else {
    generatorPackage = generator.startsWith(PREFIX)
      ? generator
      : `${PREFIX}${generator}`;
    generatorName = generatorPackage.slice(PREFIX.length);
  }

  // handle subgenerators
  generatorPackage = generatorPackage.split(':').shift();

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
