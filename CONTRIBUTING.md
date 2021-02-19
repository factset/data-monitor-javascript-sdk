# Contributing

## Development Overview
For `npm` users running package.json scripts, `yarn` can be replaced with `npm run`.

Install package dependencies:

`yarn` or `npm install`

Build the ES6 module dist:

`yarn build`

Build the global bundle dist:

`yarn build:global`

Run a development loop:

`yarn dev`

Run the package tests:

`yarn test`

Check styles:

`yarn lint`

Autofix syles:

`yarn lint:fix`

## Lockfiles
This package uses the `yarn` package manager. Please use `yarn` when contributing a dependency change. `npm` users should not commit their `package-lock.json`.

## Commit standards
Releases are automated based on the commit message format.

Commits in this package follow the [Angular Conventional Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)
