const express = require('express');
const router = express.Router();
const { createUser, loginUser, renewToken, logoutUser, forgotPassword } = require('../controller/authController');

router.post('/create-customer', createUser);
router.post('/user-login', loginUser);
router.post('/renew-token', renewToken);
router.post('/user-logout', logoutUser);
router.post('/forgot-password', forgotPassword);


module.exports = router;
