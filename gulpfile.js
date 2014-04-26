/* jshint strict:false, node:true */

var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    reporter = require('jshint-stylish')

var paths = {
  js: ['src/**/*.js', '!src/vendor/**']
}

gulp.task('js', function () {
  gulp.src('src/quill.js')

    .pipe(browserify({
      standalone: 'Quill'
    }))

    .pipe(uglify({
      preserveComments: 'some'
    }))

    .pipe(rename('quill.min.js'))

    .pipe(gulp.dest('./dist/'))
})

gulp.task('lint', function () {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter(reporter))
})

// We trigger minimization at start.
gulp.task('watch', ['js'], function () {
  var watcher = gulp.watch(paths.js, ['lint', 'js'])

  function atStart () {
    console.log('Waiting for changes...')
  }
  process.nextTick(atStart)

  watcher.on('change', function (e) {
    var path = e.path.replace('/Users/luc/Projects/quill/', '')

    console.log('File ' + path + ' was ' + e.type + ', compiling...')
  })
})

gulp.task('default', ['lint' ,'js'])