/* eslint-env node */
module.exports = function(grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var karmaReporter = grunt.option('reporters') || 'progress';
    var karmaBrowser = grunt.option('browsers') || 'PhantomJS';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        banner: '/*!\n' +
 '* @author <%= pkg.author %>\n' +
 '* @version <%= pkg.version %>\n' +
 '* @url <%= pkg.url %>\n' +
 '* @license MIT\n' +
 '* @description <%= pkg.description %>\n' +
 '*/\n',
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            files: [
                'Gruntfile.js', 'src/taggle.js'
            ]
        },

        clean: {
            src: 'tmp'
        },

        concat: {
            ie8: {
                files: {
                    'tmp/taggle-ie8.concat.js': [
                        'src/taggle-ie8.js',
                        'src/taggle-ie9.js',
                        'src/taggle.js'
                    ]
                }
            },
            ie9: {
                files: {
                    'tmp/taggle-ie9.concat.js': [
                        'src/taggle-ie9.js',
                        'src/taggle.js'
                    ]
                }
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            ie8: {
                files: {
                    'dist/taggle-ie8.min.js': [
                        'tmp/taggle-ie8.concat.js'
                    ]
                }
            },
            ie9: {
                files: {
                    'dist/taggle-ie9.min.js': [
                        'tmp/taggle-ie9.concat.js'
                    ]
                }
            },
            main: {
                files: {
                    'dist/taggle.min.js': [
                        'src/taggle.js'
                    ]
                }
            }
        },

        sass: {
            options: {
                style: 'expanded'
            },
            dist: {
                files: {
                    'assets/css/taggle.css': ['assets/scss/taggle.scss']
                }
            }
        },

        cssmin: {
            compress: {
                files: {
                    'assets/css/taggle.min.css': ['assets/css/taggle.css']
                }
            }
        },

        compass: {
            options: {
                config: 'config.rb',
                sassDir: 'assets/scss',
                cssDir: 'assets/css'
            }
        },

        watch: {
            all: {
                files: ['Gruntfile.js', 'src/**/*', 'test/**/*'],
                tasks: ['eslint', 'test']
            }
        },

        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: karmaBrowser.split(','),
                singleRun: grunt.option('single-run') ? false : true,
                logLevel: 'error',
                reporters: karmaReporter.split(',').concat('coverage'),
                client: {
                    captureConsole: !!grunt.option('console')
                }
            },
            main: {
                files: [{
                    src: [
                        'src/**/*.js',
                        'test/**/*-test.js'
                    ]
                }]
            }
        }
    });

    // register task
    grunt.registerTask('build', ['mocha', 'uglify:main', 'ie9', 'ie8']);
    grunt.registerTask('build:modern', ['mocha', 'sass', 'cssmin', 'uglify:main']);
    grunt.registerTask('ie9', ['mocha', 'sass', 'cssmin', 'concat:ie9', 'uglify:ie9', 'clean']);
    grunt.registerTask('ie8', ['mocha', 'sass', 'cssmin', 'concat:ie8', 'uglify:ie8', 'clean']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('dev', ['watch']);

};
