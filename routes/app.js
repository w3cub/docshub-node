
var express = require('express');
var models = require('@models/index');
const ncache = require('node-caches');
const path = require('path');

var resolveMiddle = function (arr) {
  var routes = [];
  arr.forEach(item => {
    var r = express.Router();
    r.get(item[0], item[1]);
    routes.push(r);
  });
  return routes;
}

var ordFile = function (file) {
  return file.replace(/[%]/g, (m) => {
    return '&#' + m.charCodeAt() + ';'
  })
}

var wrapFileWithDocsLayout = function (file) {
  // ord tag scope
  return "{% layout 'docs.html' %}\n {%ooooooooopsraw%}" + ordFile(file) + '\n{%endooooooooopsraw%}';
}

module.exports = function (engine) {
  const fileCache = ncache.config({
    store: 'file',
    options: {
      path: path.resolve(__dirname, '.cache')
    }
  })
  var routers = [
    ['/', function (req, res, next) {
      var data = models.index();
      res.render('index', data);
    }],
    ['/about', function (req, res, next) {
      var data = models.app();
      res.render('about', data);
    }],
    ['/app', function (req, res, next) {
      var data = models.app();
      res.render('app', data);
    }],
    ['/json/:slug-:hash', function (req, res, next) {
      models.docsJson(req.params, req, res, next);
    }],
    ['/:slug*', async function (req, res, next) {
      var slug = req.params.slug;
      var isIndex = req.params[0] === '';
      var file = models.docsfile(slug, isIndex, req.params[0]);
      if (file) {
        let cfile = await fileCache.read(file.filePath);
        if (cfile) {
          res.send(cfile);
        } else {
          var parsed = models.parseFile(file.content, file.filePath, isIndex, slug)
          var str = wrapFileWithDocsLayout(parsed.content);
          var tpl = engine.parse(str);
          engine
            .render(tpl, models.fileData(slug, parsed))
            .then(function (html) {
              fileCache.write(file.filePath, html);
              res.send(html);
            });
        }
      } else {
        next();
      }
    }]
  ]
  return resolveMiddle(routers)
};
