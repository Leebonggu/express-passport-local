const passport = require('passport');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const getLogin = (req, res) => {
  if (req.user) {
    return res.send('Login GET');
  } else {
    return res.send('Login이 필요합니다');
  }
}

const postLogin = (req, res, next) => {
  console.log('In PostLogin');
  passport.authenticate('local', (err, user, info) => {
    console.log('In PostLogin > passport.authenticate');
    if (err)  {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginError) => {
      console.log('In PostLogin > passport.authenticate > PostLogin Req Login');
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(200).send(user);
    })
  })(req, res, next);
};

const postSignup = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;
    if (!email || !password || !passwordConfirm) {
      throw new Error('필수요소가 빠졌습니다.');
    }
    
    const [user] = db.filter(u => u.email === email);
    if (user) {
      throw new Error('이미 존재하는 유저입니다.');
    }
    if (password !== passwordConfirm) {
      throw new Error('비밀번호를 확인해주세요');
    }
    // Store hash in your password DB.
    bcrypt.hash(password, 10, function(err, hash) {
      if (err) {
        console.error(err);
        throw new Error(err);
      }
      db.push({
        id: uuidv4(),
        email,
        password: hash,
      });
      return res.send(db);
    });
  
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.send('Logout');
  });
}

module. exports = {
  postLogin,
  postSignup,
  getLogin,
  getLogout
};

// Note: passport.authenticate() middleware invokes req.login() automatically. This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.