require.config({
    baseUrl: '../lib',
    paths: {
        'test': '..',
        'src':'../../src',
        'node-forge': 'forge',
        'chai': 'chai',
        'setimmediate': 'setImmediate'
    }
});

require([], function() {
    'use strict';

    mocha.setup('bdd');

    require(['test/unit-test-buffer', 'test/unit-test-crypto', 'test/unit-test-http', 'test/unit-test-net', 'test/unit-test-querystring', 'test/unit-test-stream', 'test/unit-test-tls', 'test/unit-test-url', 'test/unit-test-util'], function() {
        mocha.run();
        mocha.checkLeaks();
    });

});