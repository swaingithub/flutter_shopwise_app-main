const express = require('express');
const router = express.Router();
const { createUser, loginUser, renewToken, logoutUser } = require('../controller/authController');

router.post('/create-customer', createUser);
router.post('/user-login', loginUser);
router.post('/renew-token', renewToken);
router.post('/user-logout', logoutUser);


module.exports = router;
