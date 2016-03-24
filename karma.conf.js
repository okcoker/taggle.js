/* eslint-env node */
module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon-chai'],
        files: [
            'src/taggle.js',
            'test/**/*-test.js'
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
        browsers: ['PhantomJS'],
        singleRun: false
    });
};
