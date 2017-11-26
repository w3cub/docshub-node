var path = require('path');

var resolve = function (...dir) {
  var dirs = dir;
  return path.join(__dirname, '../', ...dirs);
}

module.exports = {
  resolve
}
