#!/usr/bin/env node

var Mincer = require('mincer');
var utils = require('@utils');

var oldsassFunctions = Mincer.SassEngine.prototype.sassFunctions;
Mincer.SassEngine.prototype.sassFunctions = function (locals) {
  var outs = oldsassFunctions.call(this, locals);
  for (var i in outs) {
    var ni = i.replace('_', '-');
    outs[ni] = outs[i];
  }
  return outs;
}

Mincer.enable('autoprefixer');

var environment = module.exports = new Mincer.Environment(utils.path.resolve('public'));
// environment.enable('source_maps');
environment.appendPath('javascripts');
environment.appendPath('stylesheets');
environment.appendPath('images');
environment.registerHelper('image_url', function (url) {
  url = environment.findAsset(url);
  return 'url(\'' + '/assets/' + url.digestPath + '\')';
})

environment.ContextClass.defineAssetPath(function (pathname, options) {
  var asset = this.environment.findAsset(pathname, options);
  if (!asset) {
    throw new Error('File ' + pathname + ' not found');
  }

  return '/assets/' + asset.digestPath;
});

//
// Prepare production-ready environment
//

if (process.env.NODE_ENV === 'production') {
  //
  // Enable JS and CSS compression
  //
  environment.jsCompressor = 'uglify';
  // (!) use csswring, because csso does not supports sourcemaps
  environment.cssCompressor = 'csswring';

  //
  // In production we assume that assets are not changed between requests,
  // so we use cached version of environment. See API docs for details.
  //
  environment = environment.index;
}

//
// Enable inline macros to embed compile-time variables into code,
// instead of using EJS and chaining extentions. Then you can write things like
//
//     var url = "$$ JSON.stringify(asset_path('my_file.js')) $$";
//
// You can set guard regexps as second param. Also you can pass multiple values
// via arrays.
//

Mincer.MacroProcessor.configure(['.js', '.css'] /*, true */);

//
// Mincer rebuilt assets on any dependency file change. But sometime result
// depends on external variables: enviroment type, helper values and so one.
// In this case, you should change enviroment "version" - place there any
// unique string.
//

// enviroment.version = md5(JSON.stringify(your_version_object));
