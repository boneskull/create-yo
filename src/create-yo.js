const npx = require('libnpx');
const symbols = require('log-symbols');
const chalk = require('chalk');
const which = require('which');

const PREFIX = 'generator-';

function create(
    argv = process.argv.slice(), npmPath = process.env.npm_execpath) {
  if (argv.length < 3) {
    throw new Error(`specify a generator to run via ${
        chalk.bold(
            'npm init yo <generator>')}. See list: http://yeoman.io/generators/`);
  }

  if (!npmPath) {
    console.error(`${symbols.warning} create-yo should be run via ${
        chalk.bold('npm init yo <generator>')}`);
    npmPath = which.sync('npm');
    console.error(`${symbols.warning} using npm executable found at ${npmPath}`);
  }

  let generator = argv.pop();
  let generatorPackage =
      generator.startsWith(PREFIX) ? generator : `${PREFIX}${generator}`;
  let generatorName = generatorPackage.slice(PREFIX.length);
  npx(npx.parseArgs(
      argv.concat('--package', generatorPackage, 'yo', '--', generatorName),
      npmPath))
}

if (require.main === module) {
  try {
    create()
    console.error(`${symbols.success} create-yo done`);
  } catch (err) {
    console.error(`${symbols.error} ${err}`);
    process.exit(1);
  }
}

exports.create = create;
