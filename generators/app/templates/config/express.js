/**
 * Module dependencies.
 */
var env = process.env.NODE_ENV || 'development';

var util = require('util');
var path = require('path');

var express = require('express');
var session = require('express-session');
var helpers = require('view-helpers');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash    = require('connect-flash');
var csrf = require('csurf');
var logger = require('morgan');

module.exports = function(app) {

  app.use(compression({
    memLevel: 9,
    level: 9
  }));

  app.set('port', 4000);
  app.set('views', './app/views/');

  app.set('view engine', 'jade');

  app.use(logger('dev', {
    skip: function (req, res) { return res.statusCode < 400 }
  }));

  app.use(methodOverride());

  app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
  app.use(bodyParser.json());                                     // parse application/json
  app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
  app.use(bodyParser.urlencoded({ extended: true }));

  /* =================================================
   Session Storage (need cookieParser and session)
  =================================================== */

  // cookieParser is required by session() middleware
  // pass the secret for signed cookies These two *must*
  // be placed in the order shown.

  app.use(cookieParser());

  var store = new session.MemoryStore();
  app.use(session({
    secret: 'Your secret here',
    store : store,
    resave: true,
    saveUninitialized: true,
    key: 'Your key here',
    cookie : {
      maxAge : 604800 // one week,
    }
  }));
  app.use(flash());

  /* =================================================
   Application Routing (and error handling)
  =================================================== */

  app.use('/img', express.static('./public/img'));
  app.use('/styles', express.static('./public/css'));
  app.use('/fonts', express.static('./public/fonts'));
  app.use('/scripts', express.static('./public/js'));


  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }

};
