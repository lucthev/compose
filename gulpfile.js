/* jshint strict:false, node:true */

var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint')

var paths = {
  js: ['src/**/*.js']
}

gulp.task('js', function () {
  gulp.src('src/compose.js')
    .pipe(browserify({
      standalone: 'Compose'
    }))
    .pipe(sourcemaps.init())
      .pipe(uglify({
        preserveComments: 'some'
      }))
      .pipe(rename('compose.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
})

gulp.task('lint', function () {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
})

// We trigger minimization at start.
gulp.task('watch', ['js'], function () {
  var watcher = gulp.watch(paths.js, ['lint', 'js'])

  function log (e) {
    var folder = new RegExp(__dirname + '/'),
        path = e.path.replace(folder, '')

    console.log('File ' + path + ' was ' + e.type + ', compiling...')
  }

  watcher.on('change', log)

  function atStart () {
    console.log('Waiting for changes...')
  }
  process.nextTick(atStart)
})

gulp.task('default', ['lint', 'js'])
