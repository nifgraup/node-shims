require.config({
    baseUrl: '../',
    paths: {
        'node-forge': 'lib/forge.min',
        'chai': 'lib/chai',
        'setimmediate': 'lib/setImmediate'
    }
});

require([], function() {
    'use strict';

    mocha.setup('bdd');

    require(['unit-test-buffer', 'unit-test-crypto', 'unit-test-http', 'unit-test-net', 'unit-test-querystring', 'unit-test-stream', 'unit-test-tls', 'unit-test-url', 'unit-test-util'], function() {
        mocha.run();
        mocha.checkLeaks();
    });

});