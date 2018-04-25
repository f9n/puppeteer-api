const fs = require('fs');
const crypto = require('crypto');

exports.writeFile = (filename, mode, data) => {
    if(data !== null && data !== "" && data != undefined) {
      fs.writeFileSync(filename, JSON.stringify(data));
    } else {
      fs.writeFileSync(filename, "");
    }
  }

exports.hashIt = (something) => {
  return crypto.createHash('md5').update(something, 'utf8').digest('hex');
}