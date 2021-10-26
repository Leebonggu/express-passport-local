const express = require('express');
const morgan = require('morgan');
const sessoin = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./config/passport');

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