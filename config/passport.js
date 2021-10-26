const passport = require('passport');
const PassportLocal = require('./passportLocal');

module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log('serialize');
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      console.log('deserialize');
      done(null, id);
    } catch (err) {
      console.log(err);
      done(err);
    }
  });
  PassportLocal();
}