#!/usr/bin/env node

var path = require('path');
var Liquid = require('liquidjs')

function rewriteExtension (source, ext) {
  var sourceExt = path.extname(source);
  return (sourceExt === ext) ? source : (source + ext);
}

module.exports = function (engine, environment) {
  // dummy helper that injects extension
  engine.registerTag('javascript', {
    parse: function (tagToken, remainTokens) {
      this.str = tagToken.args; // name
    },
    render: function (scope, hash) {
      var str = Liquid.evalValue(this.str, scope); // 'alice'
      var asset = environment.findAsset(str);
      if (!asset) {
        // this will help us notify that given logicalPath is not found
        // without "breaking" view renderer
        return ('<script type="application/javascript">alert("Javascript file ' +
          JSON.stringify(str).replace(/"/g, '\\"') +
          ' not found.")</script>');
      }

      return ('<script type="application/javascript" src="/assets/' +
        rewriteExtension(asset.digestPath, '.js') +
        '"></script>');
    }
  })

  engine.registerTag('stylesheet', {
    parse: function (tagToken, remainTokens) {
      this.str = tagToken.args; // name
    },
    render: function (scope, hash) {
      var str = Liquid.evalValue(this.str, scope); // 'alice'
      var asset = environment.findAsset(str);
      if (!asset) {
        // this will help us notify that given logicalPath is not found
        // without "breaking" view renderer
        return ('<script type="application/javascript">alert("Stylesheet file ' +
          JSON.stringify(str).replace(/"/g, '\\"') +
          ' not found.")</script>');
      }
      return ('<link rel="stylesheet" type="text/css" href="/assets/' +
        rewriteExtension(asset.digestPath, '.css') +
        '" />');
    }
  })

  engine.registerTag('ooooooooopsraw', {
    parse: function (tagToken, remainTokens) {
      this.tokens = []

      var stream = engine.parser.parseStream(remainTokens)
      stream
        .on('token', token => {
          if (token.name === 'endooooooooopsraw') stream.stop()
          else this.tokens.push(token)
        })
        .on('end', x => {
          throw new Error(`tag ${tagToken.raw} not closed`)
        })
      stream.start()
    },
    render: function (scope, hash) {
      var tokens = this.tokens.map(token => token.raw).join('')
      return Promise.resolve(tokens)
    }
  })
};
