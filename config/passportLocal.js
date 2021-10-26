const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { passwordVerify } = require('../utils/user');
const db = require('../db');

const PassportLocal = async () => {
  try  {
    passport.use(new LocalStrategy({
      // 내가 원하는 이름으로 하기 원한다면? => 이렇게
      usernameField: 'email',
      passwordField: 'password'
    },
      function(username, password, done) {
        // db;
        console.log('In LocalStrategy');
        const [user] = db.filter(u => u.email === username);
        if (!user) {
          return done(null, false, { message: '유저가 없습니다.'});
        }
        if (!passwordVerify(password, user.password,)) {
          return done(null, false, { message: '비밀번호가 틀렸습니다.'});
        }
        return done(null, user);
      }
    ));
  } catch (err) {
    console.log(err);
  }
};

module.exports = PassportLocal;