'use strict';
const router = require('express').Router();
const user = require('../../app/controller/user');
const isAuthenticated = require("./../../middlewares/isAuthenticated");
const interswitch = require('../../app/controller/interswitch');
const transactions = require('../../app/controller/transaction');
const s3 = require('../../app/helper/s3');
const isPFKAuthenticated = require("./../../middlewares/isPFKAuthenticated");

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

router.get('/interswitch/query-transaction/webpay/:transactionReference/:amount/:productId', interswitch.queryWebPayTransaction)

router.get('/interswitch/banks', interswitch.getBanks)

router.post('/interswitch/payment-advice', interswitch.sendPaymentAdvice)
router.post('/interswitch/validate-customer', interswitch.validateCustomer)

router.get('/interswitch/transactions/user', isPFKAuthenticated, transactions.fetchForUser )

router.get('/interswitch/query-transaction/:payafrikTransactionRef', interswitch.queryTransaction)

module.exports = router
