var glob = require('glob');
var del = require('del');
var path = require("path");

var bower = require('bower');
var gulp = require('gulp');
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
var browserify = require('gulp-browserify');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var mainBowerFiles = require('gulp-main-bower-files');

// Server + browser with live refresh / injection
var browserSync = require('browser-sync');
var reload = browserSync.reload

paths = {
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

options = sass({
  errLogToConsole: true,
  outputStyle: 'expanded'
});


/**
 * Bower install
 * Used gulp bower nameofplugin to install your plugin
 */
gulp.task('bower', function(cb){
  bower.commands.install([], {save: true}, {})
    .on('end', function(installed){
      cb();
    });
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
  return gulp.src(paths.scripts.input + '/**/*.js')
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(browserify())
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.output))
    .pipe(reload({stream: true}));
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


gulp.task('install-bower', function() {
  return gulp.src('./bower.json')
    .pipe(install())
});

gulp.task('main-bower-files', ['install-bower'], function() {
  return gulp.src('./bower.json')
    .pipe(mainBowerFiles())
    .pipe(gulp.dest('./app/scripts/libs'));
});

gulp.task('browserify', ['main-bower-files'], function () {
  var dir = __dirname + '/app/scripts/modules/';
  var requires = glob.sync(dir + '**/*.js').map(function(file) {
    return [file, {expose: path.basename(file, '.js') }];
  });
  gulp.src( dir + 'core.js')
    .pipe(browserify({
      insertGlobals: false,
      require: requires
    }))
    .pipe(rename('modules.js'))
//    .pipe(concat('modules.js'))
    .pipe(gulp.dest('./public/js/'));
});

/**
 * Test mocha
 */
gulp.task('mocha', function () {
  gulp.src('./test/mocha.js')
    .pipe(mocha({reporter: 'spec'}));
});

//gulp.task('phantomjs', function () {
//  gulp.src('.')
//    .pipe(exec('phantomjs ./test/phantom.js', {silent: false}));
//});

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
  gulp.watch('./app/views/**/*.jade', [reload]);
  gulp.watch('./app/scripts/**/*.js', [reload]);
  gulp.watch('./app/images/**/*', [reload]);
});

// #################
// # Main Gulp Tasks
// #################

gulp.task('default', ['mocha', 'build']);
gulp.task('serve', ['css', 'server', 'img', 'browsersync', 'watch']);
// gulp.task('test', ['eslint', 'mocha', 'phantomjs']);
gulp.task('build', ['css', 'jade']);
