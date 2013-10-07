module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: ['*.js', 'src/node-util.js', 'src/node-net.js', 'src/node-tls.js', 'src/node-stream.js', 'src/node-crypto.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/unit-test-*.js']
            }
        },
        copy: {
            npm: {
                expand: true,
                flatten: true,
                cwd: 'node_modules/',
                src: [
                    'chai/chai.js',
                    'mocha/mocha.js',
                    'mocha/mocha.css',
                    'requirejs/require.js',
                    'setimmediate/setImmediate.js',
                    'node-forge/js/*'
                ],
                dest: 'test/lib/'
            }
        },
        clean: {
            test: ['test/lib/']
        }
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('test', ['jshint', 'mochaTest']);
    grunt.registerTask('default', ['jshint', 'mochaTest', 'clean', 'copy']);
};