'use strict';
const router = require('express').Router();
const user = require('../../app/controller/user');
const isAuthenticated = require("./../../middlewares/isAuthenticated");
const interswitch = require('../../app/controller/interswitch');
const s3 = require('../../app/helper/s3');

// add route
router.post('/login', user.login);
router.post('/signup', user.signUp);
router.put('/confirm/:confirmationCode', user.confirm);
router.get('/user', isAuthenticated, user.me);

router.put('/kyc/update', isAuthenticated, s3.uploadS3.single('file'), user.updateKyc)

router.get('/interswitch/categories', interswitch.getBillerCategories)
router.get('/interswitch/billers', interswitch.getBillers)
router.get('/interswitch/billers/category/:categoryId', interswitch.getBillersByCategory)
router.get('/interswitch/biller/:billerId', interswitch.getBillersPaymentItems)

module.exports = router
