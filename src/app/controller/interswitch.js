const requestPromise = require("request-promise");
const keySanitizer = require("keys-to-camelcase");
const response = require('./../responses');
const helpers = require("../helper/helpers");
const sha512 = require('js-sha512');
const userHelper = require('../helper/user');
const transactionHelper = require('../helper/transaction');
const interswitchRequestAdapter = require("../helper/interswitch-adpter");
const billerHelper = require('../helper/biller');
const superpay = require("../helper/superpay");
const iRecharge = require("../helper/iRecharge");
const config = require("config");

// TO DO: REfactor transaction checks
const mongoose = require('mongoose');
const vatebra = require("../helper/vatebra");
const Transaction = mongoose.model('Transaction');

let requestHeaders = {};

getBillerCategories = async (req, res) => {
  // let url = "https://sandbox.interswitchng.com/api/v2/quickteller/categorys";
  let url = 'https://saturn.interswitchng.com/api/v2/quickteller/categorys';
  let verb = "GET";

  let categories = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb, encryptionMethod: 'SHA1' });
  } catch (error) {
    console.log(error);
  }
  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  try {
    console.log("Headers====>", requestHeaders)
    categories = await requestPromise(requestOptions);
    categories = interswitchRequestAdapter.parseResponse(categories).categorys;

    // console.log(categories.length);
    // return categories;
    return response.ok(res, categories)
    // console.log(categories);
  } catch (error) {
    console.log(error.message);
    // return response.error(res, error.message);
    response.interswitchError(res, error);
  }
};

getBanks = async (req, res) => {
  let url = "https://sandbox.interswitchng.com/api/v2/quickteller/configuration/fundstransferbanks";
  // let url = 'https://saturn.interswitchng.com/api/v2/quickteller/configuration/fundstransferbanks';
  let verb = "GET";

  let banks = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
    requestHeaders.TerminalId = config.interswitch.TERMINAL_ID
    // requestHeaders.TerminalId = "3PFK0001"
  } catch (error) {
    console.log(error);
  }
  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  console.log("Headers====>", requestHeaders)
  try {
    banks = await requestPromise(requestOptions);
    console.log(banks)
    banks = interswitchRequestAdapter.parseResponse(banks);
    return response.ok(res, banks)
  } catch (error) {
    console.log(error)
    response.interswitchError(res, error);
  }
};

validateCustomerName = async (req, res) => {
  const bankCode = req.body.bankCbnCode;
  const accountId = req.body.accountNumber;
  let url = 'https://sandbox.interswitchng.com/api/v1/nameenquiry/banks/accounts/names';
  let verb = "GET";

  console.log('URL===>', url)

  let validationResponse = null;

  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb, encryptionMethod: 'SHA-1' });
    requestHeaders.TerminalId = config.interswitch.TERMINAL_ID
  } catch (error) {
    console.log(error);
  }
  requestHeaders.bankCode = bankCode
  requestHeaders.accountId = accountId

  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  console.log("Headers====>", requestHeaders)
  try {
    validationResponse = await requestPromise(requestOptions);

    console.log('RESPONSE ===> ', validationResponse)
    // validationResponse = interswitchRequestAdapter.parseResponse(validationResponse);
    return response.ok(res, interswitchRequestAdapter.parseResponse(validationResponse));
  } catch (error) {
    console.log(error.message);
    response.interswitchError(res, error);
  }
}

// transferFunds = async (req, res) => {

// }

fundCustomer = async (req, res) => {
  const pfkUserToken = req.headers['pfk-user-token']
  const amount = req.body.amount;
  const initiatingCurrencyCode = '566';
  const terminatingCurrencyCode = '566';
  const initiatingPaymentMethodCode = 'CA';
  const terminatingPaymentMethodCode = 'AC';
  const terminatingCountryCode = 'NG';
  /**
   * This is the bank account number or prepaid card PAN
   */
  const accountNumber = req.body.accountNumber;
  /**
   * terminating entity code is the bank code when transferring to a bank account
   * it will be set to a default value if not provided in the request
   * (in the case of transfer to card)
   */
  const terminatingEntityCode= req.body.bankCode;
  const amountInMajorCurrency = amount / 100
  const user = await getUserDetails(pfkUserToken, amountInMajorCurrency)

  if (!user.canProceed) {
    return response.conflict(res, { message: "User does not have enough tokens" });
  }

  const macCipher = amount + initiatingCurrencyCode + initiatingPaymentMethodCode + amount + terminatingCurrencyCode + terminatingPaymentMethodCode + terminatingCountryCode
  const mac = sha512(macCipher)

  let requestPayload = {
    mac: mac,
    beneficiary: {
      lastname: user.userLastName || 'Victor',
      othernames: user.userFirstName || 'Victor',
      phone: user.userPhoneNumber || 'Daniels'
    },
    initiatingEntityCode: "PFK",
    initiation: {
      amount: amount,
      channel: "7",
      currencyCode: initiatingCurrencyCode,
      paymentMethodCode: initiatingPaymentMethodCode
    },
    sender: {
      email: "info@payafrik.io",
      lastname: "Limited",
      othernames: "Payafrik",
      phone: "08124888436"
    },
    termination: {
      accountReceivable: {
        accountNumber: accountNumber,
        accountType: "00"
      },
      amount: amount,
      countryCode: terminatingCountryCode,
      currencyCode: terminatingCurrencyCode,
      paymentMethodCode: terminatingPaymentMethodCode
    },
    transferCode: config.interswitch.PREFIX + userHelper.generateRandomCode(8, true)
  }

  if (terminatingEntityCode && terminatingEntityCode !== ''){
    requestPayload.termination.entityCode = terminatingEntityCode
  } else {
    requestPayload.termination.entityCode = '058'
  }
  console.log('TRANSFER TO CARD PAYLOAD => ', requestPayload)


  let url = `https://saturn.interswitchng.com/api/v2/quickteller/payments/transfers`;
  // let url = `https://sandbox.interswitchng.com/api/v2/quickteller/payments/transfers`;
  let verb = "POST";
  let transferResponse = null;

  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }

  console.log('TRANSFER TO CARD HEADERS => ', requestHeaders)


  // let customerResuest = {
  //   customers: [{ customerId: customerId, paymentCode: paymentCode }]
  // };
  let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestPayload) };
  try {
    transferResponse = await requestPromise(requestOptions);
    console.log('RAW RESPONSE===>', transferResponse)
    transferResponse = interswitchRequestAdapter.parseResponse(transferResponse);

    return response.ok(res, transferResponse);
  } catch (error) {
    console.log(error.message);
    response.interswitchError(res, error);
  }
}

getBillers = async (req, res) => {
  let url = "https://saturn.interswitchng.com/api/v2/quickteller/billers";
  let verb = "GET";
  let billers = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }
  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  try {
    billers = await requestPromise(requestOptions);
    billers = interswitchRequestAdapter.parseResponse(billers).billers;
    billers = billerHelper.removeBillersWithAlternatives(billers)
    billers.forEach((biller) => {
      biller.itemsUrl = 'biller/interswitch/' + biller.billerid
    })
    // Add AEDC to Billers List
    // billers.unshift(superpay.getAEDCObject())
    const ireChargeBillers = iRecharge.getIrecharcgeBillers()
    billers = [...ireChargeBillers, ...billers]
    return response.ok(res, billers)
  } catch (error) {
    console.log(error.message);
    // return response.error(res, error.message);
    response.interswitchError(res, error);
  }
};

getBillersByCategory = async (req, res) => {
  const categoryId = req.params.categoryId
  let url = `https://saturn.interswitchng.com/api/v2/quickteller/categorys/${categoryId}/billers`;
  let verb = "GET";
  let billers = null;
  console.log("getting billers");
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }
  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  try {
    billers = await requestPromise(requestOptions);
    billers = interswitchRequestAdapter.parseResponse(billers).billers;
    billers = billerHelper.removeBillersWithAlternatives(billers)
    billers.forEach((biller) => {
      biller.itemsUrl = 'biller/interswitch/' + biller.billerid
    })
    // Add AEDC Object to the array if it is the utilities category
    if (categoryId == 1) {
      const ireChargeBillers = iRecharge.getIrecharcgeBillers()
      billers = [...ireChargeBillers, ...billers]
      // await billers.unshift(superpay.getAEDCObject())
      // const vatebraBillers = vatebra.getVatebraBillers()
      // billers = [...vatebraBillers, ...billers]
    }
    return response.ok(res, billers)
  } catch (error) {
    console.log(error.message);
    // return response.error(res, error.message);
    response.interswitchError(res, error);
  }
};

getBillersPaymentItems = async (req, res) => {
  const billerId = req.params.billerId
  if (billerId !== "AED") {
    let url = `https://saturn.interswitchng.com/api/v2/quickteller/billers/${billerId}/paymentitems`;
    let verb = "GET";
    let paymentItems = null;
    try {
      requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
    } catch (error) {
      console.log(error);
    }
    let requestOptions = { uri: url, method: verb, headers: requestHeaders };
    try {
      paymentItems = await requestPromise(requestOptions);
      paymentItems = interswitchRequestAdapter.parseResponse(paymentItems).paymentitems;
      console.log(paymentItems[0]);

      // return paymentItems;
      return response.ok(res, paymentItems)
    } catch (error) {
      console.log(error.message);
      return response.error(res, error.message);
    }
  }
  else {
    const paymentItems = [superpay.getAEDCPaymentItemObject()]
    return response.ok(res, paymentItems)
  }
};

/**
 * DEPRECATE AFTER NEW INTEGRATIONS
 */

validateCustomer = async (req, res) => {
  // validateCustomer = async (customerId, paymentCode) => {
  const customerId = req.body.customerId;
  const paymentCode = req.body.paymentCode
  let url = `https://saturn.interswitchng.com/api/v2/quickteller/customers/validations`;
  let verb = "POST";
  let validationResponse = null;

  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }
  let customerResuest = {
    customers: [{ customerId: customerId, paymentCode: paymentCode }]
  };
  let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(customerResuest) };
  try {
    validationResponse = await requestPromise(requestOptions);
    validationResponse = interswitchRequestAdapter.parseResponse(validationResponse);
    return response.ok(res, validationResponse.Customers[0]);
  } catch (error) {
    console.log(error.message);
    response.interswitchError(res, error);
  }
};
// 
sendPaymentAdvice = async (req, res) => {
  // sendPaymentAdvice = async (customerId, paymentCode, mobileNumber, emailAddress, amount, requestReference) => {
  const pfkUserToken = req.headers['pfk-user-token']
  const amount = req.body.amount / 100
  const billerSouce = req.params.billerSource || 'INTERSWITCH'

  if (!pfkUserToken || pfkUserToken === '') {
    return response.badRequest(res, { message: 'pfk-user-token is required in the request header' });
  }
  let user = await getUserDetails(pfkUserToken, amount)
  if (!user.canProceed) {
    return response.conflict(res, { message: "User does not have enough tokens" });
  }
  const userId = user.userId
  const username = user.username

  const vendExternal = billerHelper.vendExternal(billerId, billerSouce)
  if(vendExternal) {
    if (vendExternal.error) {
      return response[vendExternal.errorType](res, vendExternal.data);
    } else {
      return response.ok(res, vendExternal) 
    }
  } else {
    let url = `https://saturn.interswitchng.com/api/v2/quickteller/payments/advices`;
    let verb = "POST";
    let adviceResponse = null;
    try {
      requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
    } catch (error) {
      console.log(error);
    }
    const requestRef = '1906' + userHelper.generateRandomCode(8);
    let adviceRequest = {
      // TerminalId: "3DMO0001"
      // TerminalId: "3PFK0001",
      paymentCode: req.body.paymentCode,
      customerId: req.body.customerId,
      customerMobile: req.body.customerMobile,
      customerEmail: req.body.customerEmail,
      amount: req.body.amount,
      requestReference: requestRef,
    };
    requestHeaders.TerminalId = config.interswitch.TERMINAL_ID
    let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(adviceRequest) };
    try {
      adviceResponse = await requestPromise(requestOptions);
      adviceResponse = interswitchRequestAdapter.parseResponse(adviceResponse);
      adviceResponse.payafrikTransactionRef = requestRef;

      // let tokenDeduction = await deductUserTokens(pfkUserToken, amount, requestRef)
      // if (!tokenDeduction) {
      //   // save the amount of tokens that need to be deducted
      //   let failureObject = {
      //     tokenDeduction: {
      //       status: false,
      //       narration: "Token deduction failed"
      //     },
      //     amount: amount
      //   }
      //   await transactionHelper.createNewTransaction(username, userId, amount, adviceResponse, failureObject, pfkUserToken)
      //   return response.error(res, { message: "Token deduction failed, amount blocked" })
      // }
      await transactionHelper.createNewTransaction('MART_PURCHASE_VIA_TOKEN', username, userId, amount, adviceResponse, {}, pfkUserToken, res, 'INTERSWITCH')
      return response.ok(res, adviceResponse);
    } catch (error) {
      console.log(error.message);
      // throw error;
      return response.interswitchError(res, error);
    }
  }
};

deductUserTokens = async (userToken, amount, requestRef) => {
  let url = `https://api.payafrik.io/exchange/utilities/transfer/`;
  let verb = "POST";
  let deductionResponse = null;
  let requestHeaders = {
    Authorization: userToken,
    "Content-Type": "application/json"
  };
  let deductionRequest = {
    "recipient": "254758462513",
    "amount": amount,
    "currency": "AFRITOKEN",
    "memo": "Payment for mart item. Ref: " + requestRef,
    "address_type": "USERNAME"
  };

  let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(deductionRequest) };
  try {
    deductionResponse = await requestPromise(requestOptions);
    return true
  } catch (error) {
    console.log("deduction Error ====>", error.message);
    // return response.error(res, {message: error.message})
    return false
  }
};


getUserDetails = async (userToken, amount, req, res) => {
  let url = `https://api.payafrik.io/auth/user/profile/`;
  let verb = "GET";
  let userResponse = null;

  let requestHeaders = {
    Authorization: userToken,
    "Content-Type": "application/json"
  };

  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  try {
    userResponse = await requestPromise(requestOptions);
    const user = JSON.parse(userResponse)
    console.log('USER RESPONSE++++++++>>>>', user)

    // check to see if user has any blocked tokens
    // let userTransactions = await Transaction.find({userId: user.id});
    // // console.log('USER TRANSACTIONS===>', userTransactions)
    // // let blockedTotal = 0
    // // if (userTransactions && userTransactions.length > 0){
    // //   userTransactions.forEach(element => {
    // //     if(!element.tokenDeduction.status){
    // //       blockedTotal += element.tokenAmount
    // //     }
    // //   });
    // // }

    if (user.balance >= amount) {
      return {
        userId: user.id,
        username: user.username,
        userFirstName: user.first_name,
        userLastName: user.last_name,
        userPhoneNumber: user.phone,
        canProceed: true
      }
    } else {
      return {
        userId: user.id,
        username: user.username,
        canProceed: false
      }
    }
  } catch (error) {
    console.log('THE ERROR========', error);
    return response.error(res, error)
  }
};

/**
 * TO BE DEPRECATED...
 */

queryTransaction = async (req, res) => {
  let transactionReference = req.params.payafrikTransactionRef
  let url = `https://sandbox.interswitchng.com/api/v2/quickteller/transactions?requestreference=${transactionReference}`;
  // let url = `https://saturn.interswitchng.com/api/v2/quickteller/transactions?requestreference=${transactionReference}`;
  let verb = "GET";
  let queryResponse = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb, encryptionMethod: 'SHA-1' });
  } catch (error) {
    console.log(error);
  }
  requestHeaders.TerminalId = config.interswitch.TERMINAL_ID

  console.log('HEADERS===>', requestHeaders)

  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  try {
    queryResponse = await requestPromise(requestOptions);
    queryResponse = interswitchRequestAdapter.parseResponse(queryResponse);

    console.log('RESPONSE===>', queryResponse)
    return response.ok(res, queryResponse);
  } catch (error) {
    console.log(error.message);
    return response.error(res, error);
  }
};

queryWebPayTransaction = async (req, res) => {
  const transactionReference = req.params.transactionReference
  const amount = req.params.amount
  const macKey = 'kP31VzqzzYKmvW7ShN3BNXOP4fQY1AOMeIv5XwiXT7GzBfFhuZ0Yga8iuNh85H7NdAUBNWCtkCopcuLWGOA1NK42DCAeclercLH8L8NgEWh8S9AVZzxD3oPjAjTQ9A5W'
  const productId = req.params.productId
  const requestHash = sha512(productId + transactionReference + macKey);

  let requestHeaders = {
    'Connection': 'Keep-Alive',
    'Host': 'webpay.interswitchng.com',
    'Hash': requestHash,
  };

  // let url = 'https://sandbox.interswitchng.com/collections/api/v1/gettransaction.json?productId=' + productId + '&transactionreference=' + transactionReference + '&amount=' + amount

  let url = 'https://webpay.interswitchng.com/collections/api/v1/gettransaction.json?productId=' + productId + '&transactionreference=' + transactionReference + '&amount=' + amount
  let verb = "GET";
  let queryResponse = null;

  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  try {
    queryResponse = await requestPromise(requestOptions);
    queryResponse = interswitchRequestAdapter.parseResponse(queryResponse);

    return response.ok(res, queryResponse);
  } catch (error) {
    console.log(error.message);
    return response.error(res, error);
  }
};

/**
 * The following are new Functions to cater for superpay, iRecharge and vatebra integrations
 */

 validateBillerCustomer = async (req, res) => {
  const pfkUserToken = req.headers['pfk-user-token']

  if (!pfkUserToken || pfkUserToken === '') {
    return response.badRequest(res, { message: 'pfk-user-token is required in the request header' });
  }

  const amount = req.body.amount / 100
  const billerSource = req.params.billerSource
  const customerId = req.body.customerId
  const billCode = req.params.billCode
  // const paymentCode = req.params.paymentCode || null

  let validationResponse = null 

  switch(billerSource) {
    case 'superpay':
      validationResponse = await superpay.validateCustomer(customerId, billCode)
      validationResponse.vendUrl = 'biller/post-transaction/SUPERPAY'
      break;
    case 'vatebra':
      validationResponse = await vatebra.validateCustomer(customerId, billCode)
      validationResponse.vendUrl = 'biller/post-transaction/VATEBRA'
      break;
    case 'irecharge':
      validationResponse = await iRecharge.validateCustomer(customerId, billCode)
      validationResponse.vendUrl = 'biller/post-transaction/IRECHARGE'
      break;
    case 'interswitch':
      validationResponse = await module.exports.validateCustomer(amount, customerId, billCode)
      validationResponse.vendUrl = 'biller/post-transaction/INTERSWITCH'
      break;
    default:
    // code block
  }

  if (validationResponse.error) {
    // Return the error
    return response[validationResponse.errorType](res, validationResponse.data);
  } else {
    return response.ok(res, validationResponse.data);
  }
 },

 queryBillerTransaction = async (req, res) => {
  const pfkUserToken = req.headers['pfk-user-token']
  if (!pfkUserToken || pfkUserToken === '') {
    return response.badRequest(res, { message: 'pfk-user-token is required in the request header' });
  }
  const amount = req.body.amount / 100
  const billerSource = req.params.billerSource
  const customerId = req.body.customerId
  const service = req.body.billerId
  const paymentCode = req.params.paymentCode || null
  let queryResponse = null 
  switch(billerSource) {
    case 'superpay':
      queryResponse = await superpay.queryTransaction(amount, customerId, phone, service)
      break;
    case 'vatebra':
      queryResponse = await vatebra.queryTransaction(customerId, service)
      break;
    case 'irecharge':
      queryResponse = await iRecharge.queryTransaction(customerId, service)
      break;
    case 'interswitch':
      queryResponse = await module.exports.queryTransaction(amount, customerId, paymentCode)
      break;
    default:
    // code block
  }
  if (queryResponse.error) {
    // Return the error
    return response[queryResponse.errorType](res, validationResponse.data);
  } else {
    return response.ok(res, queryResponse.data);
  }
 }

 getPaymentItemsForBiller = async (req, res) => {
  const billerId = req.params.billerId
  const billerSouce = req.params.billerSource
  const externalItems = billerHelper.getExternalBillerItems(billerId, billerSouce)
  if(externalItems) {
    if (externalItems.error) {
      return response[externalItems.errorType](res, externalItems.data);
    } else {
      const paymentItems = externalItems
      paymentItems.forEach((item) => {
        item.validationUrl = 'biller/validate-customer/'+ billerSouce +'/' + item.paymentitemid
      });
      return response.ok(res, paymentItems) 
    }
  } else {
    // if (billerId !== "AED") {
    let url = `https://saturn.interswitchng.com/api/v2/quickteller/billers/${billerId}/paymentitems`;
    let verb = "GET";
    let paymentItems = null;
    try {
      requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
    } catch (error) {
      console.log(error);
    }
    let requestOptions = { uri: url, method: verb, headers: requestHeaders };
    try {
      paymentItems = await requestPromise(requestOptions);
      paymentItems = interswitchRequestAdapter.parseResponse(paymentItems).paymentitems;
      paymentItems.forEach((item) => {
        item.validationUrl = 'biller/validate-customer/interswitch/' + item.paymentCode
      })
      // return paymentItems;
      return response.ok(res, paymentItems)
    } catch (error) {
      console.log(error.message);
      return response.error(res, error.message);
    }
  }
  // }
  // else {
  //   const paymentItems = [superpay.getAEDCPaymentItemObject()]
  //   return response.ok(res, paymentItems)
  // }
};

module.exports = {
  getBillerCategories: getBillerCategories,
  getBillers: getBillers,
  getBillersByCategory: getBillersByCategory,
  getBillersPaymentItems: getBillersPaymentItems,
  validateCustomer: validateCustomer,
  sendPaymentAdvice: sendPaymentAdvice,
  queryTransaction: queryTransaction,
  queryWebPayTransaction: queryWebPayTransaction,
  getBanks: getBanks,
  validateCustomerName: validateCustomerName,
  fundCustomer: fundCustomer,
  validateBillerCustomer: validateBillerCustomer,
  getPaymentItemsForBiller: getPaymentItemsForBiller
};

