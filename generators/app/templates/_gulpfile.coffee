// generated on <%= date %> using <%= name %> <%= version %>
# Load all required libraries.
gulp       = require 'gulp'
<% if (cssPreprocessor === 'sass') { %>
sass       = require 'gulp-sass'
<% } %>
prefix     = require 'gulp-autoprefixer' # Prefix CSS with Autoprefixer
sourcemaps = require 'gulp-sourcemaps' # Source map support for Gulp.js
concat     = require 'gulp-concat'
plumber     = require 'gulp-plumber' # Prevent pipe breaking caused by errors from gulp plugins
nodemon     = require 'gulp-nodemon'
cssmin     = require 'gulp-cssmin'
jade       = require 'gulp-jade'
browserSync = require 'browser-sync'
  .create()


path =
  src: './app'
  dist: './public'
  scripts:
    input: src + '/js'
    output: dist + '/js'
  styles:
    input: src + '/styles'
    output: dist + '/css'
  test:
    input: 'src/js/**/*.js'
    karma: 'test/karma.conf.js'
    spec: 'test/spec/**/*.js'
    coverage: 'test/coverage/'
    results: 'test/results/'

<% if (cssPreprocessor === 'sass') { %>
options =
  sass
    errLogToConsole: true
    outputStyle: 'expanded'
<% } %>

gulp.task 'css', ->
  gulp.src 'app/styles/**/*.{scss, css}'
    .pipe plumber()
    <% if (cssPreprocessor === 'sass') { %>
    .pipe sass(options.sass)
    <% } %>
    .pipe prefix "> 1%"
    .pipe cssmin keepSpecialComments: 0
    .pipe gulp.dest 'public/css'
    .pipe browserSync
      .stream()

gulp.task 'js', ->
  return gulp.src 'app/js/**/*js'
    .pipe browserify()
    .pipe uglify()
    .pipe gulp.dest 'public/js'
    .pipe browserSync
      .stream()

gulp.task 'server', ->
  nodemon
    script: 'app.js'

gulp.task 'reload', ->
  browserSync.init null,
    logPrefix: 4000
    proxy: 'http://localhost:4000'
    port: 4001
    logFileChanges: true
    logConnections: false
    logLevel: 'info'
    open: true
    injectChanges: true
    timestamps: false
    ui:
      port: 8085
      weinre:
        port: 9090
    ghostMode:
      clicks: true
      forms: true
      scroll: false



# Default task
gulp.task 'default', ['css', 'server', watch']
