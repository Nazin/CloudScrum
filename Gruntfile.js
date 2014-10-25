module.exports = function (grunt) {
    'use strict';

    var config = {
        less: {
            main: {
                options: {
                    compress: true
                },
                files: {
                    'public/css/main.css': ['public/css/main.less']
                }
            }
        },
        watch: {
            main: {
                options: {
                    nospawn: true
                },
                files: ['public/css/main.less'],
                tasks: ['less:main']
            },
            reload: {
                options: {
                    livereload: true
                },
                files: ['public/css/**/*.css']
            }
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('default', ['less', 'watch']);

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};