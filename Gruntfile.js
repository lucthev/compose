/* jshint ignore:start */

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jasmine: {
      test: {
        src: 'dist/<%= pkg.name %>.min.js',
        options: {
          specs: 'test/*.spec.js',
          helpers: 'test/utils/*.js',
          keepRunner: true
        }
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'src/',
          name: 'vendor/almond/almond',
          include: ['<%= pkg.name %>'],
          wrap: {
            startFile: 'src/build/start.frag',
            endFile: 'src/build/end.frag'
          },
          optimize: 'none',
          out: './dist/<%= pkg.name %>.js'
        }
      }
    },

    // TODO: keep original banner comments.
    uglify: {
      options: {
        sourceMap: true
      },
      my_target: {
        files: {
          './dist/<%= pkg.name %>.min.js': './dist/<%= pkg.name %>.js'
        }
      }
    },

    watch: {
      scripts: {
        files: ['src/*.js', 'src/commands/*.js'],
        tasks: ['default']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-requirejs')

  grunt.registerTask('default', ['requirejs', 'uglify'])
}