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

    jshint: {
      options: {
        jshintrc: true
      },

      all: [
        'Gruntfile.js',
        'src/**/*.js',
        '!src/vendor/**']
    },

    // We make separate builds - an AMD one, and a Global one.
    requirejs: {
      amd: {
        options: {
          baseUrl: 'src/',
          name: '<%= pkg.name %>',
          wrap: {
            start: '(function() {\n',
            end: '}())'
          },
          optimize: 'none',
          out: './dist/<%= pkg.name %>.amd.js'
        }
      },

      global: {
        options: {
          baseUrl: 'src/',
          name: 'vendor/almond/almond',
          include: ['../dist/<%= pkg.name %>.amd.js'],
          wrap: {
            startFile: 'src/build/start.frag',
            endFile: 'src/build/end.frag'
          },
          optimize: 'none',
          out: './dist/<%= pkg.name %>.js'
        }
      }
    },

    // TODO: keep original banner comments (?).
    uglify: {
      options: {
        banner: '/* <%= pkg.name %> v<%= pkg.version %> - git.io/fKuJEw */',
        sourceMap: true
      },
      src: {
        files: {
          './dist/<%= pkg.name %>.amd.min.js': './dist/<%= pkg.name %>.amd.js',
          './dist/<%= pkg.name %>.min.js': './dist/<%= pkg.name %>.js'
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'src/**/*.js',
          '!src/vendor/**'
        ],
        tasks: ['default']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-requirejs')
  grunt.loadNpmTasks('grunt-contrib-jshint')

  grunt.registerTask('default', ['jshint', 'requirejs', 'uglify'])
}