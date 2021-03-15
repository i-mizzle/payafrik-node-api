'use strict';
const response = require('../responses');
const interswitchRequestAdapter = require("../helper/interswitch-adpter");
const axios = require('axios');
const cryptoRandomString = require('crypto-random-string');
const config = require("config");
const sha512 = require("js-sha512")

module.exports = {
    validateCustomer: async (customerId, paymentCode) => {
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
    }
};
