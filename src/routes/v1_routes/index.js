'use strict';
const router = require('express').Router();
const user = require('../../app/controller/user');
const isAuthenticated = require("./../../middlewares/isAuthenticated");
const interswitch = require('../../app/controller/interswitch');
const flutterwave = require('../../app/controller/flutterwave');
const superpay = require('../../app/controller/superpay');
const transactions = require('../../app/controller/transaction');
const s3 = require('../../app/helper/s3');
const isPFKAuthenticated = require("./../../middlewares/isPFKAuthenticated");

router.post('/login', user.login);
router.post('/signup', user.signUp);
router.put('/confirm/:confirmationCode', user.confirm);
router.get('/user', isAuthenticated, user.me);
router.put('/kyc/update', isAuthenticated, s3.uploadS3.single('file'), user.updateKyc)

// INTEGRATED ROUTES
router.post('/biller/validate-customer/:billerSource/:billCode', isPFKAuthenticated, interswitch.validateBillerCustomer)
router.post('/biller/post-transaction/:billerSource', isPFKAuthenticated, interswitch.sendPaymentAdvice)
router.get('/biller/:billerSource/:billerId', interswitch.getPaymentItemsForBiller)

router.get('/interswitch/categories', interswitch.getBillerCategories)
router.get('/interswitch/billers', interswitch.getBillers)
router.get('/interswitch/billers/category/:categoryId', interswitch.getBillersByCategory)
router.get('/interswitch/biller/:billerId', interswitch.getBillersPaymentItems)
router.get('/interswitch/query-transaction/webpay/:transactionReference/:amount/:productId', interswitch.queryWebPayTransaction)
router.post('/interswitch/payment-advice', interswitch.sendPaymentAdvice)
router.post('/interswitch/validate-customer', interswitch.validateCustomer)

// INTERSWITCH FUNDS TRANSFER
router.get('/interswitch/banks', interswitch.getBanks)
router.post('/interswitch/banks/validate-customer', isPFKAuthenticated, interswitch.validateCustomerName)
router.post('/interswitch/fund-customer', isPFKAuthenticated, interswitch.fundCustomer)

// FLUTTERWAVE
router.get('/flutterwave/banks/:country', isPFKAuthenticated, flutterwave.getBanks)
router.post('/flutterwave/banks/validate-account', isPFKAuthenticated, flutterwave.validateAccount)
router.post('/flutterwave/banks/transfer/charges', isPFKAuthenticated, flutterwave.getTransferCharges)
router.post('/flutterwave/banks/transfer', isPFKAuthenticated, flutterwave.transferFunds)
router.get('/flutterwave/banks/transfers', isPFKAuthenticated, flutterwave.getAllTransfers)
router.get('/flutterwave/banks/transfer/:transferId', isPFKAuthenticated, flutterwave.getTransferById)


// SUPERPAY ENDPOINTS
router.post('/superpay/aedc/validate-customer', isPFKAuthenticated, superpay.validateAEDCCustomer)
router.post('/superpay/aedc/payment', isPFKAuthenticated, superpay.payForAEDC)
router.post('/superpay/aedc/verify-payment', isPFKAuthenticated, superpay.validateAEDCCustomer)

// TRANSACTIONS
router.post('/interswitch/transactions/new', isPFKAuthenticated, transactions.create)
router.get('/interswitch/transactions/user', isPFKAuthenticated, transactions.fetchForUser)
// router.get('/interswitch/transactions/user/:username', isPFKAuthenticated, transactions.fetchForUser)
router.get('/interswitch/transactions/search/:searchQuery', isPFKAuthenticated, transactions.searchTransactions)
router.get('/interswitch/transactions/all', isPFKAuthenticated, transactions.fetch)
router.put('/interswitch/transactions/update/:payafrikTransactionRef', isPFKAuthenticated, transactions.updateTransaction)
// router.get('/transactions/query/:ref', interswitch.queryTransaction)
router.get('/interswitch/query-transaction/:payafrikTransactionRef', interswitch.queryTransaction)

module.exports = router
