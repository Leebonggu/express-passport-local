# Express-passport-local

로그인 인증과정 스터디 중

## Passport: Simple, unobtrusive authentication for Node.js

패스포트에 대한 공식페이지 설명을보면

>Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application. A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.

- 인증(authentication)을 위한 Node.js 미들웨어다.
- 유연하고 모듈화 되어있다.
- express 기반 웹에 연동이 잘된다.
- 기본 유저네임/패스워드를 사용하는 방식부터, 페이스북, 트위터 등 다양한 인증방식을 지원한다(strategy라고 표현)

## Passport LocalStrategy

LocalDatagase, username, password를 이용해 쿠키/세션을 통해 사용자 인증을 수행하는 방식

## passport.initialize(), passport.session()

### passport.initialize()
- 서버의 요청(req)에 passport  폴더의 index.js에 작성한 설정들을 입력한다. passport를 미들웨어로 사용하겠다는 선언의 의미.

### passport.session()

- req.session에 passport 정보를 저장한다. req.session은 express-session이 생성하므로, express-session보다 나중에 실행되어야 한다.

```js
const express = require('express');
const morgan = require('morgan');
const sessoin = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./config');

const api = require('./routes');
const app = express();

app.set('trust proxy', 1);
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
passportConfig();
app.use(sessoin({
  secret: process.env.COOKIE_SECRET,
  resave: false, // 매 request 마다 세션을 계속 다시 저장하는 것
  saveUninitialized: false, // 세션에 저장할 내역이 없더라도 세션을 저장할지 대한 설정 (보통 방문자를 추적할 때 사용된다.)
  cookie: {
    httpOnly: true, //자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
    secure: false,
    maxAge: null,
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);

module.exports = app;
```

## passport.serializeUser(), passport.deserializeUser()

### passport.serializeUser()

- req.session 객체에 어떤 데이터를 저장할지 선택
- 유저의 정보를 모두 담는 것은 효율적이지 않을 수 있다.
- id와 같이 고유한 값만을 저장하는 것이 바람직하다
- serializeUser는 로그인이 진행될 때 한번 실행된다.

### passport.deserializeUser()

- 페이지를 이동할때마다(passport.session()이 실행될 때마다) 호출된다.
- serializeUser로 session에 id가 저정되어있으므로, id를 통해 Local Database를 조회한다.
- 조회된 결과를 req.user에 넘겨줄 수  있으므로, 로그인된 사용자의 정보를 확인가능하다.

```js
// passport config
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
```

## LocalStrategy

- 첫번째 인자로 객체를 전달하는데, usernameField, passpwordFeild에 다른 값을 설정해, 프론트에서 넘어오는 데이터 이름으로 변경가능하다(기본값은 username, password)
- 두번째 인자로 callback을 전달하고, 각각 (username, password, done)의 데이터가 전달된다.
- 이 함수 내에서 데이터베이스에 유저가 존재하는지 확인하고, 패스워드를 확인한다.
- 확인결과 문제가 없다면 done(null, data)를 넘겨준다
- 로그인에 실패한다면 done(null, false, 실패이유)을 전달해준다.

```js
// passport-local config
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
        console.log(username, password)
        const [user] = db.filter(u => u.email === username);
        if (!user) {
          return done(null, false, { message: '유저가 없습니다.'});
        }
        if (!passwordVerify(password, user.password,)) {
          return done(null, false, { message: '비밀번호가 틀렸습니다.'});
        }
        console.log('passport Local');
        return done(null, user);
      }
    ));
  } catch (err) {
    console.log(err);
  }
};

module.exports = PassportLocal;
```

## req.isAuthenticated()

Passport의 도움으로 req.isAuthenticated() 함수를 사용할  수 있다. isAuthenticated의 리턴값은 `boolean`이다, 이 함수를 미들웨어를 만들어 인가(접근제어) 기능을 구현가능하다.

```js
// middlewares

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
}

module.exports = { isAuthenticated, isNotAuthenticated }
```

```js
//  routes
const router = require('express').Router();
const  { postLogin, postSignup, getLogin, getLogout } = require('../controller/user.ctrl');
const { isNotAuthenticated, isAuthenticated } = require('../middlewares/user');

router.post('/signup', isNotAuthenticated, postSignup);
router.route('/login')
  .get(getLogin)
  .post(isNotAuthenticated, postLogin);

router.get('/logout', isAuthenticated, getLogout);

module.exports = router;
```

## 미들웨어 확장

 - 미들웨어를 확장하지 않고 사용하면, passport내에서 request, response를 사용할수 없다.
 - 따라서 미들웨어 확장을 통해 passport내에서 request, response를 사용하기 위함

 ```js
//  예시
const morgan = require('morgan');

// 일반 사용 시 - dev : 개발모드
app.use(morgan('dev'));

// 미들웨어 확장법 1
app.use((req, res, next) => {
  morgan('dev')(req, res, next);
});
 ```

```js
//  적용
const postLogin = (req, res, next) => {
  console.log('PostLogin');
  passport.authenticate('local', (err, user, info) => {
    console.log('postLoginPassport');
    if (err)  {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginError) => {
      console.log('PostLogin Req Login');
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(200).send(user);
    })
  })(req, res, next);
};
```

## 로그인요청부터 완료될떄까지 순서
![순서](/images/sequence.png)
## 출처

- [passport-local](http://www.passportjs.org/packages/passport-local/)
- [[번역] `passport-local`에 대해 알아야 하는 모든 것](https://velog.io/@jakeseo_me/%EB%B2%88%EC%97%AD-passport-local%EC%97%90-%EB%8C%80%ED%95%B4-%EC%95%8C%EC%95%84%EC%95%BC-%ED%95%98%EB%8A%94-%EB%AA%A8%EB%93%A0-%EA%B2%83)
- [[Node.js] express-session 다뤄보기](https://dev-dain.tistory.com/68)
- [Passort 로그인(미들웨어 확장)](https://velog.io/@0viii0viii/Passport-JS)
- [인증(Authentication)과 인가(Authorization)의 차이](https://velog.io/@taeha7b/authentication-jwt-bcrypt-authorization)
- [Node.js passport](https://medium.com/@vdongbin/node-js-passport-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-33e2eab2389b)
- [미들웨어 확장](https://velog.io/@xka926/express-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4#%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4-%ED%99%95%EC%9E%A5%EB%B2%95)