var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var nodemon = require('gulp-nodemon');
var cssmin = require('gulp-cssmin');
var jade = require('gulp-jade');
var eslint = require('gulp-eslint');

// Server + browser with live refresh / injection
var browserSync = require('browser-sync');
var reload = browserSync.reload

path = {
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
 * CSS task
 * Used to generate the CSS files using SASS files
 */
gulp.task('css', function() {
  return gulp.src('./app/styles/**/*.scss')
    .pipe(plumber())<% if (cssPreprocessor === 'sass (simple)' || 'sass (complexe)') { %>
    .pipe(sass(options.sass))<% } %>
    .pipe(prefix("> 1%"))
    .pipe(gulp.dest('./public/css'))
    .pipe(reload({stream: true}));
});

/**
 * JavaScript task
 */
gulp.task('js', function() {
  return gulp.src(this.path.scripts.input + '/**/*.js')
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(browserify())
    .pipe(uglify())
    .pipe(gulp.dest(path.scripts.output))
    .pipe(reload({stream: true}));
});

/**
 * JavaScript task
 */
gulp.task('img', function() {
  return gulp.src(path.images.input + '/**/*.{jpg, jpeg, png, gif}')
    .pipe(plumber())
    .pipe(gulp.dest(path.images.output))
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
 * Reload task
 * Using browserify to reload pages
 */
gulp.task('reload', function() {
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
});

gulp.task('serve', ['css', 'server', 'reload', 'watch']);
gulp.task('default', ['test','build']);
gulp.task('build', ['css', 'jade']);
