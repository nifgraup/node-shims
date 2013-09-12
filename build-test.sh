#!/bin/sh

echo "> copying dependencies for browser testing\n"

cd `dirname $0`

cp -v node_modules/chai/chai.js test/lib/
cp -v node_modules/mocha/mocha.js test/lib/
cp -v node_modules/mocha/mocha.css test/res/
cp -v node_modules/setimmediate/setImmediate.js test/lib/
cp -v node_modules/mocha/mocha.js test/lib/
cp -v node_modules/requirejs/require.js test/lib/
cp -v node_modules/node-forge/js/forge.min.js test/lib/

echo "\n> browser test is ready for execution\n"
