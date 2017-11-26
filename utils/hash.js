var fs = require('fs');
var crypto = require('crypto');

var hashFile = function (src, len) {
  var text = fs.readFileSync(src);
  return hashText(text, len)
};
var hashText = function (text, len) {
  // md5 sha1
  var hash = crypto.createHash('sha1').update(text).digest('hex');
  if (len > 0) {
    hash = hash.substr(0, len);
  }
  return hash;
}

module.exports = {
  hashFile,
  hashText
}
