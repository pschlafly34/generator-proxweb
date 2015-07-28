'use strict';

var util = require('util');
var path = require('path');
var generators = require('yeoman-generator');
var glob = require('glob');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var yosay = require('yosay');

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

    whichFramework: function () {

      if (this.options.whichFramework) {
        return true;
      }

      var done = this.async();
      var prompt = [{
        type: 'list',
        name: 'whichFramework',
        message: 'Select a framework to use:',
        choices: [
          'None',
          'ExpressJS',
          'AngularJS'
        ],
        store: true
      }];

      this.prompt(prompt, function (response) {
        this.options.whichFramework = response.whichFramework.toLowerCase();
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
          'None',
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
          'None',
          'Sass'
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
        this.templatePath('_gulpfile.coffee'),
        this.destinationPath('gulpfile.coffee'),
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
          whichFramework: this.options.whichFramework,
          viewEngine: this.options.viewEngine,
          database: this.options.database
        }
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
      this.copy('_editorconfig', '.editorconfig');

      this.mkdir('app');
      this.mkdir('app/views');


      if (this.options.versionning === 'git') {
        this.fs.copy(
          this.templatePath('_gitignore'),
          this.destinationPath('.gitignore'));
      }

      // Framework
      if (this.options.whichFramework === 'expressjs') {
        this.mkdir('app/controllers');
        this.mkdir('app/models');
      }

      // CSS preprocessor
      if (this.options.cssPreprocessor === 'sass') {
        this.mkdir('app/styles/base');
        this.mkdir('app/styles/helpers');
        this.mkdir('app/styles/layout');
        this.mkdir('app/styles/components');
        this.mkdir('app/styles/pages');
        this.mkdir('app/styles/vendors');
        this.copy('app/styles/theme/global.scss');
      }

      // Database
      if (this.options.database === 'json') {
        this.mkdir('db');
      }
      if (this.options.database === 'mongodb') {
        this.mkdir('data');
      }

      // Public directories
      mkdirp.sync('public');
      mkdirp.sync('public/fonts');
      mkdirp.sync('public/html');
      mkdirp.sync('public/js');
      mkdirp.sync('public/css');
      mkdirp.sync('public/img');
    },

    // install: function () {
    //   this.installDependencies({
    //     skipMessage: this.options['skip-install-message'],
    //     skipInstall: this.options['skip-install']
    //   });
    // },

    // end: function () {
    //   var howToInstall =
    //     '\nAfter running ' +
    //     chalk.yellow.bold('npm install & bower install') +
    //     ', inject your' +
    //     '\nfront end dependencies by running ' +
    //     chalk.yellow.bold('gulp wiredep') +
    //     '.';

    //   if (this.options['skip-install']) {
    //     this.log(howToInstall);
    //     return;
    //   }
    // }

  }

});
