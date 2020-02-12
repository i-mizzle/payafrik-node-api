const requestPromise = require("request-promise");
const keySanitizer = require("keys-to-camelcase");
const response = require('./../responses');
const helpers = require("../helper/helpers");
const interswitchRequestAdapter = require("../helper/interswitch-adpter");

let requestHeaders = {};

getBillerCategories = async (req, res) => {
  let url = "https://sandbox.interswitchng.com/api/v2/quickteller/categorys";
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
  }
};

getBillers = async (req, res) => {
  let url = "https://sandbox.interswitchng.com/api/v2/quickteller/billers";
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
  }
};

getBillersByCategory = async (req, res) => {
  const categoryId = req.params.categoryId
  let url = `https://sandbox.interswitchng.com/api/v2/quickteller/categorys/${categoryId}/billers`;
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
  }
};

getBillersPaymentItems = async (req, res) => {
  const billerId = req.params.billerId
  let url = `https://sandbox.interswitchng.com/api/v2/quickteller/billers/${billerId}/paymentitems`;
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
  }
};

validateCustomer = async (customerId, paymentCode) => {
  let url = `https://sandbox.interswitchng.com/api/v2/quickteller/customers/validations`;
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

    return validationResponse.Customers[0];
  } catch (error) {
    console.log(error.message);
  }
};

sendPaymentAdvice = async (customerId, paymentCode, mobileNumber, emailAddress, amount, requestReference) => {
  let url = `https://sandbox.interswitchng.com/api/v2/quickteller/payments/advices`;
  let verb = "POST";
  let adviceResponse = null;
  try {
    requestHeaders = interswitchRequestAdapter.getHeaders({ url: url, method: verb });
  } catch (error) {
    console.log(error);
  }
  let adviceRequest = {
    TerminalId: "3DMO0001",
    paymentCode: paymentCode,
    customerId: customerId,
    customerMobile: mobileNumber,
    customerEmail: emailAddress,
    amount: amount,
    requestReference: requestReference
  };

  console.log(adviceRequest);

  let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(adviceRequest) };
  try {
    adviceResponse = await requestPromise(requestOptions);
    adviceResponse = interswitchRequestAdapter.parseResponse(adviceResponse);
    console.log(adviceResponse);
    return adviceResponse;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

queryTransaction = async transactionReference => {
  let url = `https://sandbox.interswitchng.com/api/v2/quickteller/transactions?requestreference=${transactionReference}`;
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
    console.log(adviceResponse);
  } catch (error) {
    console.log(error.message);
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
