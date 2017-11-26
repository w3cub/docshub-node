var config = require('../config');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var string = require('../utils/string');
var hash = require('../utils/hash');
var cheerio = require('cheerio');

var resolve = function (...dir) {
  var dirs = dir;
  return path.join(__dirname, '../', ...dirs);
}

var readFile = function (file) {
  return fs.readFileSync(file).toString();
}
var fileExits = function (file) {
  return fs.existsSync(file)
}

var docsjsonFile = readFile(resolve(config.docs.path));
var file = JSON.parse(docsjsonFile);
var digestHash = hash.hashText(docsjsonFile, 32);

var index = function () {
  return {
    page: {
      className: 'index-page'
    },
    site: config.site,
    docs: file
  }
};
var app = function () {
  return {
    page: {
      className: 'static-page'
    },
    credits: require('@root/data/credits'),
    site: config.site
  }
}
var docInfo = function (slug) {
  return _.find(file, ['slug', slug]);
};
var docsfile = function (slug, isIndex, subPath) {
  var content = `<div class="_static"><div class="_error"><h1 class="_error-title"> Page not found. </h1><p class="_error-text"> It may be missing from the source documentation or this could be a bug. </p><p class="_error-links"><a href="#" data-behavior="back" class="_error-link">Go back</a></p></div></div>`;
  var filePath = false;
  var dirRoot = resolve(config.docs.dir);
  var fpath = '';
  var rfpath = '';
  if (isIndex) {
    fpath = path.join(slug, '/index.html');
    rfpath = path.join(dirRoot, fpath);
    if (fileExits(rfpath)) {
      content = readFile(rfpath)
      filePath = fpath;
    }
  } else {
    try {
      fpath = path.join(slug, `${subPath}.html`);
      rfpath = path.join(dirRoot, fpath);
      if (fileExits(rfpath)) {
        content = readFile(rfpath)
        filePath = fpath;
      } else {
        fpath = path.join(slug, `${subPath}/index.html`);
        rfpath = path.join(dirRoot, fpath);
        if (fileExits(rfpath)) {
          content = readFile(rfpath)
          filePath = fpath;
        }
      }
    } catch (e) {
    }
  }
  return {
    content,
    filePath
  }
}
var fixLinkRegex = /(?=(?:(?!(\/|^)index).)*)((\/|^)index)?(?=#|$)/;
var gLink = /^http(s)?/;
// https://github.com/cheeriojs/cheerio
// https://cheerio.js.org/
var parseFile = function (file, filePath, isIndex, slug) {
  var $ = cheerio.load(file);
  var description = '';
  var title = '';
  var slugTitle = '';
  var cdoc = docInfo(slug);
  var type = cdoc['type'];
  slugTitle = cdoc['name'] + (cdoc['version'] ? ' ' + cdoc['version'] : '');
  if (isIndex) {
    title = slugTitle + ' documentation';
    description = title
  } else {
    title = $('h1').text() + ' - ' + slugTitle
    description = $('p').first().text();
  }
  var keywords = string.keywords(title, slug);
  // $('a').each(function (i, el) {
  //   var link = $(this);
  //   var href = link.attr('href')
  //   if (false && href) {
  //     if (!gLink.test(href)) {
  //       if (/^([^#]|\.\.\/)/.test(href)) {
  //         if (!/\w+\/index\.html/.test(filePath)) {
  //           href = '../' + href
  //         }
  //       }
  //       href = href.replace(fixLinkRegex, '/')
  //       if (/api/.test(href) && slug === 'bower') {
  //         href = href.replace(/api\/?/, '')
  //       }
  //       link.attr('href', href)
  //     } else {
  //       link.attr('target', '_blank')
  //     }
  //   }
  // })
  var content = $('body').html();
  var digestPath = slug + '-' + digestHash;
  return {
    title,
    slugTitle,
    slug,
    type,
    description,
    keywords,
    digestPath,
    content
  }
  // cheerio
}

var fileData = function (slug, data = {}) {
  const page = _.pick(data, ['title', 'slugTitle', 'slug', 'type', 'description', 'digestPath', 'keywords']);
  return {
    page: page,
    site: config.site
    // json: docsJson(slug)
  }
}

var docsJson = function (params, req, res, next) {
  var slug = params.slug;
  var phash = params.hash;
  var fileName = `${slug}-${phash}`;
  var solovePath = resolve('public/assets', fileName);
  if (fileExits(solovePath)) {
    res.sendFile(solovePath);
  } else {
    var doc = docInfo(slug);
    var indexdoc = JSON.parse(readFile(resolve(config.docs.dir, slug, 'index.json')));
    var entries = indexdoc['entries'];
    indexdoc.entries = entries.map((item) => {
      item['path'] = item['path'].replace(fixLinkRegex, '');
      return item;
    });
    var buffer = `app.DOC=${JSON.stringify(doc)};app.INDEXDOC=${JSON.stringify(indexdoc)};`;
    var length = buffer.length;
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Content-Length', length);
    res.statusCode = 200;
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    // res.end(buffer);
    fs.writeFileSync(solovePath, buffer);
    res.sendFile(solovePath);
  }
}

module.exports = { index, app, docInfo, docsfile, parseFile, docsJson, fileData };
