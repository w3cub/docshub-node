#!/usr/bin/env node

var express = require('express');
var Liquid = require('liquidjs');
var path = require('path');
// var fs = require('fs');
// var crypto = require('crypto');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Mincer = require('mincer');
var extendLiquidTag = require('./com/liquid/tag');
// var assetFunctions = require('node-sass-asset-functions');
// var compassImporter = require('compass-importer');

// var sassMiddleware = require('node-sass-middleware');
// var coffeeMiddleware = require('coffee-middleware');
// var hash = require('./utils/hash');

var allRouters = require('./routes/app');

var resolve = function (dir) {
  return path.join(__dirname, dir);
}

var engine = Liquid({
  root: [resolve('views/'), resolve('views/_includes/'), resolve('views/_layouts/')], // for layouts and partials
  extname: '.html'
})

var environment = require('./environment');

var app = express();

app.engine('html', engine.express());

// view engine setup
app.set('views', [resolve('views/'), resolve('views/_includes/'), resolve('views/_layouts/')]);
// app.set('view engine', 'html');
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/assets/', Mincer.createServer(environment));

extendLiquidTag(engine, environment);

// app.use('/stylesheets', sassMiddleware({
//   src: resolve('public/stylesheets'),
//   dest: resolve('public/stylesheets'),
//   indentedSyntax: false, // true = .sass and false = .scss
//   sourceMap: true
// }));

// app.use('/javascripts', coffeeMiddleware({
//   src: resolve('public/javascripts'),
//   compress: true
// }));

app.use('/', express.static(resolve('public')));

app.use('/', allRouters(engine));

// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  console.info(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
