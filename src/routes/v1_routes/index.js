'use strict';
const router = require('express').Router();
const user = require('../../app/controller/user');
const isAuthenticated = require("./../../middlewares/isAuthenticated");

router.post('/login', user.login);
router.post('/signup', user.signUp);
router.put('/confirm/:confirmationMode', user.confirm);
router.get('/user', isAuthenticated, user.me);

module.exports = router
