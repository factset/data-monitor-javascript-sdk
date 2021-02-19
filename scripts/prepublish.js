const replace = require('replace');
const pkg = require('../package.json');
const {join} = require('path');

function replaceVersionString() {
  replace({
    regex: 'VERSION_REPLACED_DURING_PREPUBLISH',
    replacement: pkg.version,
    paths: [join(__dirname, '../dist/')],
    recursive: true,
    silent: true,
  });
}

replaceVersionString();
