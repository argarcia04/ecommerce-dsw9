// routes/userAuth.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/userAuthController');

router.get( '/register', ctrl.showRegister);
router.post('/register', ctrl.register);
router.get( '/login',    ctrl.showLogin);
router.post('/login',    ctrl.login);
router.post('/logout',   ctrl.logout);

module.exports = router;
