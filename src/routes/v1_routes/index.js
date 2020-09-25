'use strict';
const router = require('express').Router();
const user = require('../../app/controller/user');
const isAuthenticated = require("./../../middlewares/isAuthenticated");
const interswitch = require('../../app/controller/interswitch');
const superpay = require('../../app/controller/superpay');
const transactions = require('../../app/controller/transaction');
const s3 = require('../../app/helper/s3');
const isPFKAuthenticated = require("./../../middlewares/isPFKAuthenticated");

router.post('/login', user.login);
router.post('/signup', user.signUp);
router.put('/confirm/:confirmationMode', user.confirm);
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

// SUPERPAY ENDPOINTS
router.post('/superpay/aedc/validate-customer', isPFKAuthenticated, superpay.validateAEDCCustomer)
router.post('/superpay/aedc/payment', isPFKAuthenticated, superpay.payForAEDC)
router.post('/superpay/aedc/verify-payment', isPFKAuthenticated, superpay.validateAEDCCustomer)

// TRANSACTIONS
router.post('/interswitch/transactions/new', isPFKAuthenticated, transactions.create)
router.get('/interswitch/transactions/user', isPFKAuthenticated, transactions.fetchForUser)
router.get('/interswitch/transactions/all', isPFKAuthenticated, transactions.fetch)
router.put('/interswitch/transactions/update/:payafrikTransactionRef', isPFKAuthenticated, transactions.updateTransaction)
router.get('/interswitch/query-transaction/:payafrikTransactionRef', interswitch.queryTransaction)

module.exports = router
