const requestPromise = require("request-promise");
const keySanitizer = require("keys-to-camelcase");
const response = require('./../responses');
const helpers = require("../helper/helpers");
const userHelper = require('../helper/user');
const interswitchRequestAdapter = require("../helper/interswitch-adpter");

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

  console.log("validating customer");

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

    // return validationResponse.Customers[0];
    return response.ok(res, validationResponse.Customers[0]);

  } catch (error) {
    console.log(error.message);
    // return response.error(res, error);
    response.interswitchError(res, error);
  }
};

sendPaymentAdvice = async (req, res) => {
// sendPaymentAdvice = async (customerId, paymentCode, mobileNumber, emailAddress, amount, requestReference) => {
  const pfkUserToken = req.headers['pfk-user-token']
  if(!pfkUserToken || pfkUserToken === ''){
    return response.badRequest(res, {message: 'pfk-user-token is required in the request header'});
  }
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
  const amount = req.body.amount/100

  requestHeaders.TerminalId = "3PFK0001"

  let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(adviceRequest) };
  try {
    adviceResponse = await requestPromise(requestOptions);
    adviceResponse = interswitchRequestAdapter.parseResponse(adviceResponse);
    adviceResponse.payafrikTransactionRef = requestRef;

    await deductUserTokens(pfkUserToken, amount)

    return response.ok(res, adviceResponse);
  } catch (error) {
    console.log(error.message);
    // throw error;
    return response.interswitchError(res, error);
  }
};

deductUserTokens = async (userToken, amount) => {
    let url = `https://api.payafrik.io/transactions/transactions/send-afk/`;
    let verb = "POST";
    let deductionResponse = null;

    let requestHeaders = {
      Authorization: userToken,
      "Content-Type": "application/json"
    };
    let deductionRequest = {
        "recipient":"shalomz",
        "requested_amount":amount
    };

    console.log("deductionRequest ====>", deductionRequest)
  
    let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(deductionRequest) };
    try {
      deductionResponse = await requestPromise(requestOptions);
      console.log(deductionResponse);
      return true
    } catch (error) {
      console.log(error.message);
      return false
    }
  };

queryTransaction = async (req, res) => {
// queryTransaction = async transactionReference => {
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

module.exports = {
  getBillerCategories: getBillerCategories,
  getBillers: getBillers,
  getBillersByCategory: getBillersByCategory,
  getBillersPaymentItems: getBillersPaymentItems,
  validateCustomer: validateCustomer,
  sendPaymentAdvice: sendPaymentAdvice,
  queryTransaction: queryTransaction
};
