#!/usr/bin/env node

'use strict';

const npx = require('libnpx');
const symbols = require('log-symbols');
const chalk = require('chalk');
const which = require('which');

const PREFIX = 'generator-';

function create(
  argv = process.argv.slice(),
  npmPath = which.sync('npm')
) {
  if (argv.length < 3) {
    throw new Error(
      `specify a generator to run via ${chalk.bold(
        'npm init yo <generator>'
      )}. See list: http://yeoman.io/generators/`
    );
  }

  let generator = argv.pop();
  let generatorPackage = generator.startsWith(PREFIX)
    ? generator
    : `${PREFIX}${generator}`;
  let generatorName = generatorPackage.slice(PREFIX.length);
  npx(
    npx.parseArgs(
      argv.concat('--package', generatorPackage, 'yo', '--', generatorName),
      npmPath
    )
  );
}

if (require.main === module) {
  try {
    create();
    console.error(`${symbols.success} create-yo done`);
  } catch (err) {
    console.error(`${symbols.error} create-yo errored:\n\n${err}`);
    process.exit(1);
  }
}

exports.create = create;
