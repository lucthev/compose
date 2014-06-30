/* jshint node:true */

'use strict';

module.exports = function (grunt) {
  var config = {
    pkg: grunt.file.readJSON('package.json'),

    jasmine: {
      test: {
        src: 'dist/<%= pkg.name %>.min.js',
        options: {
          specs: 'test/unit/**/*-spec.js',
          display: 'short',
          summary: true,
          keepRunner: true
        }
      }
    },

    env: {
      sauce: {
        SAUCE_USERNAME: 'lucthev',
        SAUCE_ACCESS_KEY: '533ff702-2a12-4680-86c9-9ad60767c51c'
      }
    },

    jasmine_node: {
      options: {
        projectRoot: 'test/functional',
        forceExit: true,
        extensions: 'js',
        specNameMatcher: 'spec'
      },
      all: ['test/functional/**/*.spec.js']
    },

    concurrent: {

      // Dynamically filled:
      test: []
    }
  }

  var browsers = ['chrome', 'opera', 'firefox', 'safari']

  // Create environment variables.
  browsers.forEach(function (browser) {
    config.env[browser] = {
      BROWSER: browser
    }
  })

  // Add tests to concurrent task.
  browsers.forEach(function (browser) {
    config.concurrent.test.push('test:' + browser)
  })

  grunt.initConfig(config)
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-env')
  grunt.loadNpmTasks('grunt-jasmine-node')
  grunt.loadNpmTasks('grunt-concurrent')

  // Register tasks.
  browsers.forEach(function (browser) {
    grunt.registerTask('test:' + browser, [
      'env:sauce',
      'env:' + browser,
      'jasmine_node'
    ])
  })

  grunt.registerTask('default', ['jasmine'])
  grunt.registerTask('test', ['jasmine', 'concurrent'])
}
