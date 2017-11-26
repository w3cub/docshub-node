var _ = require('lodash');

// https://en.wikipedia.org/wiki/Stop_words
// every,for,from,get,off,only
var stopWords = function () {
  return `a,able,about,across,after,all,almost,also,am,among,an,
  and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,
  do,does,either,else,ever,got,had,has,have,he,her,
  hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,
  likely,may,me,might,most,must,my,neither,no,nor,not,of,often,on,
  or,other,our,own,rather,said,say,says,she,should,since,so,some,than,
  that,the,their,them,then,there,these,they,this,
  tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,
  who,whom,why,will,with,would,yet,you,your`.replace(/[\n\s]/g, '').split(',')
}

var smallWords = stopWords();

var keywords = function (str, slug = '') {
  var nstr = _(str).trim().toLowerCase().replace(/[/.\s()\d,@:\-_`"]+/g, ' ');
  var arr = nstr.split(' ');
  arr.push(slug);
  arr = _.uniq(arr);
  return _.reject(arr, function (c) {
    return c === '' || typeof c === 'number' || _.includes(smallWords, c)
  }).join(', ').replace(/[\x00\t\n]/g, '')
}

var ordText = function (text) {
  return text.replace(/[%"']/g, ((m) => {
    return '&#' + m.charCodeAt() + ';'
  }))
}

module.exports = {
  stopWords,
  keywords,
  ordText
}
