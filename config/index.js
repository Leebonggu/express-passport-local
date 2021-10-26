const passport = require('passport');
const PassportLocal = require('./passportLocal');

module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log('In Serialize');
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      console.log('In Deserialize');
      done(null, id);
    } catch (err) {
      console.log(err);
      done(err);
    }
  });
  PassportLocal();
}