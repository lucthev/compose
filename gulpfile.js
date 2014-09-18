/* jshint strict:false, node:true */

var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('browserify'),
    vinyl = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    Mocha = require('mocha'),
    request = require('request'),
    karma = require('karma').server,
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs')

var paths = {
  js: ['src/**/*.js'],
  test: './test/functional'
}

gulp.task('browserify', function () {
  return browserify('./src/compose.js', { standalone: 'Compose' })
    .plugin('bundle-collapser/plugin')
    .bundle()
    .on('error', function (err) {
      console.log(err.toString())
      this.emit('end')
    })
    .pipe(vinyl('compose.min.js'))
    .pipe(gulp.dest('dist'))
})

gulp.task('minify', ['browserify'], function () {
  gulp.src('dist/compose.min.js')
    .pipe(sourcemaps.init())
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
})

gulp.task('lint', function () {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
})

// We trigger minimization at start.
gulp.task('watch', ['minify'], function () {
  var watcher = gulp.watch(paths.js, ['minify'])

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

var seleniumPath = './vendor/selenium-2.42.2.jar',
    seleniumUrl = 'https://selenium-release.storage.googleapis.com/2.42/' +
      'selenium-server-standalone-2.42.2.jar'

gulp.task('test', ['minify'], function (done) {
  if (!fs.existsSync(seleniumPath)) {
    console.log('Downloading selenium server…')

    fs.mkdir('./vendor', function (err) {
      if (err && err.code !== 'EEXIST') throw err

      request(seleniumUrl)
        .pipe(fs.createWriteStream(seleniumPath))
        .on('finish', function () {
          runTests(done)
        })
    })
  } else {
    runTests(done)
  }
})

function runTests (done) {
  karma.start({
    configFile: path.join(__dirname, 'test/unit/karma.conf.js'),
    singleRun: true
  }, function () {
    process.stdout.write(
      '\n  ' +
      chalk.red('NOTE') +
      ': pending tests should be checked manually.'
    )

    var mocha = new Mocha()
    mocha.timeout(120000)

    fs.readdirSync(paths.test)
      .filter(function (filename) {
        return /spec\.js$/.test(filename)
      })
      .forEach(function (file) {
        mocha.addFile(path.join(paths.test, file))
      })

    mocha.run(done)
  })
}

gulp.task('default', ['lint', 'minify'])
