/* eslint-env node */
'use strict';

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'sinon'],
        files: [
            'src/taggle.js',
            '__tests__/**/*-test.js'
        ],
        plugins: [
            require('karma-jasmine'),
            require('karma-sinon'),
            require('karma-coverage'),
            require('karma-chrome-launcher')
        ],
        preprocessors: {
            'src/taggle.js': ['coverage']
        },
        webpackMiddleware: {
            noInfo: true
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                // { type: 'html', subdir: 'report-html' },
                { type: 'lcov', subdir: 'report-lcov' }
            ]
        },
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['ChromeHeadless'],
        singleRun: false
    });
};
