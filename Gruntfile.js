/* jshint node:true */

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jasmine: {
      test: {
        src: 'dist/<%= pkg.name %>.min.js',
        options: {
          specs: 'test/*.spec.js',
          helpers: 'test/utils.js',
          keepRunner: true
        }
      }
    },
  })

  grunt.loadNpmTasks('grunt-contrib-jasmine')

  grunt.registerTask('default', ['jasmine'])
}