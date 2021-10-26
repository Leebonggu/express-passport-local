const router = require('express').Router();
const  { postLogin, postSignup, getLogin, getLogout } = require('../controller/user.ctrl');


router.get('/', (req, res) => {
  console.log('Helo');
  res.send('hello');
});

router.post('/signup', postSignup);
router.route('/login')
  .get(getLogin)
  .post(postLogin);

router.get('/logout', getLogout);

module.exports = router;