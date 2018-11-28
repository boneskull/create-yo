# create-yo

> Use any Yeoman generator with "npm init"

As of npm v6.1.0, you can [use a custom package](https://github.com/npm/npm/pull/20403) with `npm init` to scaffold a project.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [License](#license)

## Install

You *could* install this, but you shouldn't have to.  Use `npm` to install globally if you wish.

### Requirements

- Node.js v8.0.0+
- npm v6.1.0+

## Usage

```shell
$ npm init yo <some-generator>
```

All Yeoman generator packages start with `generator-`; this prefix is *optional*.  In other words, `npm init yo license` will work just as well as `npm init yo generator-license`.

See [a list of generators here](http://yeoman.io/generators/).

## Notes

This package does little other than monkey with arguments and invoke `npx` programmatically.

## Contribution

Please use [Angular Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).  Messages are checked using [commitlint](https://npm.im/commitlint).

PRO TIP: After staging your changes with `git add`, use `npm run commit` for a fancy interactive prompt.

## Maintainers

[@boneskull](https://github.com/boneskull)

## License

Copyright © 2018 Christopher Hiller.  Licensed Apache-2.0
