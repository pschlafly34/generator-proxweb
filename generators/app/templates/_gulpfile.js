'use strict';

var glob = require('glob');
var del = require('del');
var path = require('path');

var bower = require('bower');
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var nodemon = require('gulp-nodemon');
var cssmin = require('gulp-cssmin');
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var install = require('gulp-install');
var browserify = require('browserify');
var debowerify = require('debowerify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var watchify = require('watchify');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var mainBowerFiles = require('gulp-main-bower-files');

// Server + browser with live refresh / injection
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var paths = {
  src: './app',
  dist: './public',
  scripts: {
    input: this.src + '/scripts',
    output: this.dist + '/js'
  },
  styles: {
    input: this.src + '/styles',
    output: this.dist + '/css'
  },
  images: {
    input: this.src + '/images',
    output: this.dist + '/img'
  },
  test: {
    input: 'src/js/**/*.js',
    karma: 'test/karma.conf.js',
    spec: 'test/spec/**/*.js',
    coverage: 'test/coverage/',
    results: 'test/results/'
  }
};

var options = sass({
  errLogToConsole: true,
  outputStyle: 'expanded'
});

/**
 * CSS task
 * Used to generate the CSS files using SASS files
 */
gulp.task('css', function() {
  return gulp.src('./app/styles/**/*.scss')
    .pipe(plumber())
    .pipe(sass(options.sass))
    .pipe(prefix("> 1%"))
    .pipe(rename('global.min.css'))
    .pipe(gulp.dest('./public/css'))
    .pipe(reload({stream: true}));
});


/**
 * JavaScript task
 */
gulp.task('js', function() {

  var dir = './app/scripts/modules/';
  var requires = glob.sync(dir + '**/*.js').map(function(file) {
    return [file, {expose: path.basename(file, '.js') }];
  });

  // gulp.src('./app/scripts/modules/main.js')

    var b = browserify({
      debug: true,
      // defining transforms here will avoid crashing your stream
    });

  return b.bundle()
    .pipe(source('./app/scripts/modules/**/*.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('./public/js'))
    .pipe(reload({stream: true}));
});

gulp.task('install-bower', function() {
  return gulp.src('./bower.json')
    .pipe(install())
});

/**
 * JavaScript task
 */
gulp.task('img', function() {
  return gulp.src(paths.images.input + '/**/*.{jpg, jpeg, png, gif}')
    .pipe(plumber())
    .pipe(gulp.dest(paths.images.output))
    .pipe(reload({stream: true}));
});

/**
 * Server task
 */
gulp.task('server', function() {
  return nodemon({
    script: 'app.js',
    watch: ['app.js']
  })
  .on('change', ['server'])
  .on('restart', function onRestart() {
    // reload connected browsers after a slight delay
    setTimeout(function () {
      reload({
        stream: true   //
      });
    }, 200);
  });
});

/**
 * Test mocha
 */
gulp.task('mocha', function () {
  gulp.src('./test/mocha.js')
    .pipe(mocha({reporter: 'spec'}));
});

/**
 * Reload task
 * Using browserify to reload pages
 */
gulp.task('browsersync', function() {
  return browserSync.init(null, {
    logPrefix: 4000,
    proxy: 'http://localhost:4000',
    port: 4001,
    logFileChanges: true,
    logConnections: false,
    logLevel: 'info',
    open: true,
    injectChanges: true,
    timestamps: false,
    ui: {
      port: 8085,
      weinre: {
        port: 9090
      }
    },
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: false
    }
  });
});


/**
 * Jade task
 */
gulp.task('jade', function() {
  return gulp.src('app/views/**/*.jade')
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('public/html'));
});


gulp.task('watch', function() {
  gulp.watch('./app/styles/**/*.scss', ['css']);
  gulp.watch('./app/views/**/*.jade', []);
  gulp.watch('./app/scripts/**/*.js', []);
  gulp.watch('./app/images/**/*', []);
});

// #################
// # Main Gulp Tasks
// #################

gulp.task('default', ['mocha', 'build']);
gulp.task('serve', ['css', 'server', 'img', 'browsersync', 'watch']);
// gulp.task('test', ['eslint', 'mocha', 'phantomjs']);
gulp.task('build', ['css', 'jade']);
