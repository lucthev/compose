/* jshint strict:false, node:true */

var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    Mocha = require('mocha'),
    request = require('request'),
    seleniumPath = './vendor/selenium-2.42.2.jar',
    seleniumUrl = 'https://selenium-release.storage.googleapis.com/2.42/' +
      'selenium-server-standalone-2.42.2.jar',
    karma = require('karma').server,
    path = require('path'),
    fs = require('fs')

var paths = {
  js: ['src/**/*.js'],
  test: './test/functional'
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

gulp.task('test', ['js'], function (done) {
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
    var mocha = new Mocha()
    mocha.timeout(120000)
    mocha.reporter('dot')

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

gulp.task('default', ['lint', 'js'])
