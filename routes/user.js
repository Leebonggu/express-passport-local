const router = require('express').Router();
const  { postLogin, postSignup, getLogin, getLogout } = require('../controller/user.ctrl');
const { isNotAuthenticated, isAuthenticated } = require('../middlewares/user');

router.post('/signup', isNotAuthenticated, postSignup);
router.route('/login')
  .get(getLogin)
  .post(isNotAuthenticated, postLogin);

router.get('/logout', isAuthenticated, getLogout);

module.exports = router;