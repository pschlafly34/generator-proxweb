'use strict';

var env = process.env.NODE_ENV || 'development';

// set up ======================================================================
var fs = require('fs');
var http = require('http'); // http://nodejs.org/docs/v0.3.1/api/http.html
var path = require('path'); // http://nodejs.org/docs/v0.3.1/api/path.html

var express = require('express');
var colors = require('colors');

var packageJSON = require('./package.json');

var app = module.exports.app = exports.app = express();

// express settings ============================================================
require('./config/express')(app)


var requireFiles = function (directory, app) {
  fs.readdirSync(directory).forEach(function (fileName) {
    // Recurse if directory
    if(fs.lstatSync(directory + '/' + fileName).isDirectory()) {
      requireFiles(directory + '/' + fileName, app);
    } else {

      // Skip this file
      if(fileName === 'index.js' && directory === __dirname) return;

      // // Skip unknown filetypes
      // if(validFileTypes.indexOf(fileName.split('.').pop()) === -1) return;

      // Require the file.
      require(directory + '/' + fileName)(app);
    }
  })
}

requireFiles('./app/routes', app);

// console.log('========= Server created ========='.green.bold);
var port = process.env.PORT || 4000;

http.createServer(app).listen(port, function() {
  console.log("## The server is ready! Let's connect on localhost:4001 ##".magenta.bold);
  // console.table([ [packageJSON.version, app.get('port')] ]);
});
