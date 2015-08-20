'use strict';

var util = require('util');
var path = require('path');

var generators = require('yeoman-generator');
var glob = require('glob');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var yosay = require('yosay');

var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: false
    });

  },
  initializing: function () {
    this.pkg = require('../../package.json');
  },
  prompting: {

    welcome: function () {
      this.log(yosay(
        'Yo! I\'m here to help build your ' +
        chalk.bold.red('Proximity BBDO') +
        ' website.'
      ));
    },

    dir: function () {

      if (this.options.createDirectory !== undefined) {
        return true;
      }

      var done = this.async();

      var prompt = [{
        type: 'confirm',
        name: 'createDirectory',
        message: 'Would you like to create a new directory for your project?'
      }];

      this.prompt(prompt, function (response) {
        this.options.createDirectory = response.createDirectory;
        done();
      }.bind(this));
    },

    dirname: function () {

      if (!this.options.createDirectory || this.options.dirname) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'input',
        name: 'dirname',
        message: 'Enter directory name'
      }];

      this.prompt(prompt, function (response) {
        this.options.dirname = response.dirname;
        done();
      }.bind(this));
    },

    versionning: function () {

      if (this.options.versionning) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'list',
        name: 'versionning',
        message: 'Select a version system:',
        choices: [
          'SVN',
          'Git'
        ],
        store: true
      }];

      this.prompt(prompt, function (response) {
        this.options.versionning = response.versionning.toLowerCase();
        done();
      }.bind(this));
    },

    whichJsFramework: function () {

      if (this.options.whichJsFramework) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'list',
        name: 'whichJsFramework',
        message: 'Select a JS framework to use:',
        choices: [
          'None',
          'ExpressJS',
          'AngularJS'
        ],
        store: true
      }];

      this.prompt(prompt, function (response) {
        this.options.whichJsFramework = response.whichJsFramework.toLowerCase();
        done();
      }.bind(this));
    },

    whichCssFramework: function () {

      if (this.options.whichCssFramework) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'list',
        name: 'whichCssFramework',
        message: 'Select a CSS framework to use:',
        choices: [
          'None',
          'Bootstrap (SASS)',
          'Foundation'
        ],
        store: true
      }];

      this.prompt(prompt, function (response) {
        this.options.whichCssFramework = response.whichCssFramework.toLowerCase();
        done();
      }.bind(this));
    },

    viewEngine: function () {

      if (this.options.viewEngine) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'list',
        name: 'viewEngine',
        message: 'Select a view engine to use:',
        choices: [
          'HTML',
          'Jade'
        ],
        store: true
      }];

      this.prompt(prompt, function (response) {
        this.options.viewEngine = response.viewEngine.toLowerCase();
        done();
      }.bind(this));
    },

    cssPreprocessor: function () {

      if (this.options.cssPreprocessor) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'list',
        name: 'cssPreprocessor',
        message: 'Select a css preprocessor to use:' ,
        choices: [
          'CSS',
          'Sass (Simple)',
          'Sass (Complexe)'
        ],
        store: true
      }];

      this.prompt(prompt, function (response) {
        this.options.cssPreprocessor = response.cssPreprocessor.toLowerCase();
        done();
      }.bind(this));
    },

    database: function () {

      if (this.options.database) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'list',
        name: 'database',
        message: 'Select a database to use:',
        choices: [
          'None',
          'JSON',
          'MongoDB'
        ],
        store: true
      }];
      this.prompt(prompt, function (response) {
        this.options.database = response.database.toLowerCase();
        done();
      }.bind(this));
    },

  },


  writing: {

    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          cssPreprocessor: this.options.cssPreprocessor
        }
      );
    },
    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          cssPreprocessor: this.options.cssPreprocessor,
          whichJsFramework: this.options.whichJsFramework,
          viewEngine: this.options.viewEngine,
          database: this.options.database
        }
      );
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.options.whichCssFramework == 'bootstrap (sass)') {
        bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
        bowerJson.overrides = {
          'bootstrap-sass': {
            'main': [
              'assets/stylesheets/_bootstrap.scss',
              'assets/fonts/bootstrap/*',
              'assets/javascripts/bootstrap.js'
            ]
          }
        };
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('_bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copyTpl(
        this.templatePath('_editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    buildEnv: function () {


      // create directory
      // if(this.options.createDirectory){
      //   this.destinationRoot(this.options.dirname);
      // }


      // css
      // var stylesheets = this.options.cssPreprocessor;
      // if (stylesheets === 'none') stylesheets = 'styles';
      // if (stylesheets === 'sass') stylesheets = 'sass';
      // this.sourceRoot(path.join(__dirname, 'templates', 'app/', stylesheets));
      // this.directory('.', 'public/css');
    },
    assetsDirs: function () {
      this.mkdir('app');
      this.mkdir('app/views');
      this.mkdir('app/styles/');

      if (this.options.versionning === 'git') {
        this.fs.copy(
          this.templatePath('_gitignore'),
          this.destinationPath('.gitignore')
        );

        this.fs.copy(
          this.templatePath('_gitattributes'),
          this.destinationPath('.gitattributes')
        );
      }

      // Framework
      if (this.options.whichJsFramework === 'expressjs') {
        this.mkdir('app/controllers');
        this.mkdir('app/routes');
        this.mkdir('config');

        this.fs.copy(
          this.templatePath('app/controllers/index.js'),
          this.destinationPath('app/controllers/index.js')
        );

        this.fs.copy(
          this.templatePath('app/routes/index.js'),
          this.destinationPath('app/routes/index.js')
        );

        this.fs.copy(
          this.templatePath('config/express.js'),
          this.destinationPath('config/express.js')
        );

        this.fs.copy(
          this.templatePath('_app.js'),
          this.destinationPath('app.js')
        );
      }

      if (this.options.whichJsFramework === 'expressjs' || 'none') {
        this.mkdir('app/scripts/');
        this.fs.copy(
          this.templatePath('app/scripts/modules/core.js'),
          this.destinationPath('app/scripts/modules/core.js')
        );
      }

      // Engine
      if (this.options.viewEngine === 'jade') {
        this.mkdir('app/views/_base');
        this.mkdir('app/views/pages');

        this.copy('app/views/_base/layout.jade');
        this.copy('app/views/_base/head.jade');
        this.copy('app/views/_base/footer.jade');
        this.copy('app/views/pages/home.jade');
      }

      if (this.options.viewEngine === 'none') {
        this.fs.copy(
          this.templatePath('app/views/pages/_index.html'),
          this.destinationPath('app/views/index.html')
        );
      }

      if (this.options.whichJsFramework === 'angularjs') {
        this.mkdir('app/scripts');

        this.fs.copy(
          this.templatePath('app/scripts'),
          this.destinationPath('app/scripts')
        );
      }

      // CSS preprocessor
      if (this.options.cssPreprocessor === 'sass (complexe)') {
        this.mkdir('app/styles/base');
        this.copy('app/styles/base/_headings.scss');
        this.copy('app/styles/base/_form.scss');
        this.copy('app/styles/base/_button.scss');
        this.copy('app/styles/base/_media.scss');
        this.copy('app/styles/base/_typography.scss');
        this.copy('app/styles/base/_table.scss');

        this.mkdir('app/styles/helpers');
        this.copy('app/styles/helpers/_functions.scss');
        this.copy('app/styles/helpers/_mixins.scss');
        this.copy('app/styles/helpers/_extends.scss');

        this.mkdir('app/styles/layout');
        this.copy('app/styles/layout/_l-grid.scss');
        this.copy('app/styles/layout/_l-header.scss');
        this.copy('app/styles/layout/_l-footer.scss');

        this.mkdir('app/styles/components');
        this.copy('app/styles/components/_all.scss');

        this.mkdir('app/styles/pages');
        this.copy('app/styles/pages/_all.scss');

        this.mkdir('app/styles/vendors');
        this.copy('app/styles/vendors/_all.scss');

        this.copy('app/styles/theme/global.scss');
        this.copy('app/styles/theme/_variables.scss');
      }

      if (this.options.cssPreprocessor === 'sass (simple)') {
        this.fs.copyTpl(
          this.templatePath('app/styles/theme/global.scss'),
          this.destinationPath('app/styles/global.scss'),
          {
            cssPreprocessor: this.options.cssPreprocessor,
            whichCssFramework: this.options.whichCssFramework
          }
        );

        this.fs.copy(
          this.templatePath('app/styles/helpers/_normalize.scss'),
          this.destinationPath('app/styles/_normalize.scss')
        );
      }

      // Database
      if (this.options.database === 'json') {
        this.mkdir('db');
      }
      if (this.options.database === 'mongodb') {
        this.mkdir('data');
        this.mkdir('app/models');

        this.fs.copy(
          this.templatePath('app/models/index.js'),
          this.destinationPath('app/models/index.js')
        );
      }

      // Public directories
      mkdirp.sync('public');
      mkdirp.sync('public/fonts');
      mkdirp.sync('public/html');
      mkdirp.sync('public/js');
      mkdirp.sync('public/css');
      mkdirp.sync('public/img');
    },

    install: function () {
      this.installDependencies({
        skipMessage: this.options['skip-install-message'],
        skipInstall: this.options['skip-install']
      });
    },

    end: function () {
      var howToInstall =
        '\nAfter running ' +
        chalk.yellow.bold('npm install & bower install') +
        ', inject your' +
        '\nfront end dependencies by running ' +
        chalk.yellow.bold('gulp wiredep') +
        '.';

      if (this.options['skip-install']) {
        this.log(howToInstall);
        return;
      }
    }

  }

});
