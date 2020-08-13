const requestPromise = require("request-promise");
const keySanitizer = require("keys-to-camelcase");
const response = require('./../responses');
const helpers = require("../helper/helpers");
const sha512 = require('js-sha512');
const userHelper = require('../helper/user');
const transactionHelper = require('../helper/transaction');
const interswitchRequestAdapter = require("../helper/interswitch-adpter");

// TO DO: REfactor transaction checks
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

let requestHeaders = {};

getBillerCategories = async (req, res) => {
  // let url = "https://sandbox.interswitchng.com/api/v2/quickteller/categorys";
  let url = 'https://saturn.interswitchng.com/api/v2/quickteller/categorys';
  let verb = "GET";

  let categories = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }
  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  try {
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
  // let url = "https://sandbox.interswitchng.com/api/v2/quickteller/categorys";
  let url = 'https://saturn.interswitchng.com/api/v2/quickteller/configuration/fundstransferbanks';
  let verb = "GET";

  let banks = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
    requestHeaders.TerminalId = "3PFK0001"
  } catch (error) {
    console.log(error);
  }
  let requestOptions = { uri: url, method: verb, headers: requestHeaders };
  console.log("Headers====>", requestHeaders)
  try {
    banks = await requestPromise(requestOptions);
    banks = interswitchRequestAdapter.parseResponse(categories).categorys;
    return response.ok(res, banks)
  } catch (error) {
    console.log(error.message);
    response.interswitchError(res, error);
  }
};

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
    console.log(billers[0]);
    // return billers;
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
    return response.ok(res, billers)
  } catch (error) {
    console.log(error.message);
    // return response.error(res, error.message);
    response.interswitchError(res, error);
  }
};

getBillersPaymentItems = async (req, res) => {
  const billerId = req.params.billerId
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
};

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

sendPaymentAdvice = async (req, res) => {
// sendPaymentAdvice = async (customerId, paymentCode, mobileNumber, emailAddress, amount, requestReference) => {
  const pfkUserToken = req.headers['pfk-user-token']
  const amount = req.body.amount/100

  if(!pfkUserToken || pfkUserToken === ''){
    return response.badRequest(res, {message: 'pfk-user-token is required in the request header'});
  }

  let user = await getUserDetails(pfkUserToken, amount)

  if(!user.canProceed){
    return response.conflict(res, {message: "User does not have enough tokens"});
  }

  const userId = user.userId
  const username = user.username

  let url = `https://saturn.interswitchng.com/api/v2/quickteller/payments/advices`;
  let verb = "POST";
  let adviceResponse = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }
  const requestRef = '1906'+userHelper.generateRandomCode(8);
  let adviceRequest = {
    // TerminalId: "3DMO0001"
    TerminalId: "3PFK0001",
    paymentCode: req.body.paymentCode,
    customerId: req.body.customerId,
    customerMobile: req.body.customerMobile,
    customerEmail: req.body.customerEmail,
    amount: req.body.amount,
    requestReference: requestRef
  };
 
  // const amount = 1000000

  requestHeaders.TerminalId = "3PFK0001"

  let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(adviceRequest) };
  try {
    adviceResponse = await requestPromise(requestOptions);
    adviceResponse = interswitchRequestAdapter.parseResponse(adviceResponse);
    adviceResponse.payafrikTransactionRef = requestRef;

    let tokenDeduction = await deductUserTokens(pfkUserToken, amount, requestRef)
    if(!tokenDeduction){
      // save the amount of tokens that need to be deducted
      let failureObject = {
          tokenDeduction: {
            status: false,
            narration: "Token deduction failed"
          },
          amount: amount
      }
      await transactionHelper.createNewTransaction(username, userId, adviceResponse, failureObject, pfkUserToken)
      return response.error(res, {message: "Token deduction failed, amount blocked"})
    }
    await transactionHelper.createNewTransaction(username, userId, adviceResponse, {}, pfkUserToken)
    return response.ok(res, adviceResponse);
  } catch (error) {
    console.log(error.message);
    // throw error;
    return response.interswitchError(res, error);
  }
};

deductUserTokens = async (userToken, amount, requestRef) => {
    let url = `https://api.payafrik.io/transactions/transactions/send/`;
    let verb = "POST";
    let deductionResponse = null;

    let requestHeaders = {
      Authorization: userToken,
      "Content-Type": "application/json"
    };
    let deductionRequest = {
        "recipient":"shalomz",
        "requested_amount":amount,
        "wallet": "AfriToken",
        "memo":"Payment for mart item. Ref: " + requestRef
    };

    console.log("deductionRequest ====>", deductionRequest)
  
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

  let requestOptions = { uri: url, method: verb, headers: requestHeaders};
  try {
    userResponse = await requestPromise(requestOptions);
    const user = JSON.parse(userResponse)

    // check to see if user has any blocked tokens
    let userTransactions = await Transaction.find({userId: user.id});
    let blockedTotal = 0
    if (userTransactions && userTransactions.length > 0){
      userTransactions.forEach(element => {
        if(!element.tokenDeduction.status){
          blockedTotal += element.tokenAmount
        }
      });
    }

    if( (user.balance - blockedTotal) >= amount ){
      return {
        userId: user.id,
        username: user.username,
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
    console.log(error.message);
    return response.error(res, error)
  }
};


queryTransaction = async (req, res) => {
  let transactionReference = req.params.payafrikTransactionRef
  let url = `https://saturn.interswitchng.com/api/v2/quickteller/transactions?requestreference=${transactionReference}`;
  let verb = "GET";
  let queryResponse = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }

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

queryWebPayTransaction = async (req, res) => {
    const transactionReference = req.params.transactionReference
    const amount = req.params.amount
    const macKey = 'D3D1D05AFE42AD50818167EAC73C109168A0F108F32645C8B59E897FA930DA44F9230910DAC9E20641823799A107A02068F7BC0F4CC41D2952E249552255710F'
    const productId = req.params.productId
    const requestHash = sha512(productId + transactionReference + macKey);

    let requestHeaders = {
      'Connection': 'Keep-Alive',
      'Host': 'sandbox.interswitchng.com',
      'Hash': requestHash,
    };
    
    let url = 'https://sandbox.interswitchng.com/webpay/api/v1/gettransaction.json?productId=' + productId + '&transactionreference=' + transactionReference + '&amount=' + amount
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

module.exports = {
  getBillerCategories: getBillerCategories,
  getBillers: getBillers,
  getBillersByCategory: getBillersByCategory,
  getBillersPaymentItems: getBillersPaymentItems,
  validateCustomer: validateCustomer,
  sendPaymentAdvice: sendPaymentAdvice,
  queryTransaction: queryTransaction,
  getBanks: getBanks,
  queryWebPayTransaction: queryWebPayTransaction
};
