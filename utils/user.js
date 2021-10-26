const bcrypt = require('bcrypt');

const passwordVerify = function(password, hash) {
  return bcrypt.compareSync(password, hash);
};

module.exports = {
  passwordVerify,
}