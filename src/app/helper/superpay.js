'use strict';
const response = require('./../responses');
const axios = require('axios');
const cryptoRandomString = require('crypto-random-string');
const config = require("config");
const sha512 = require("js-sha512")

module.exports = {
    getAEDCObject: () => {
        return {
            "categoryid": "1",
            "categoryname": "Utilities",
            "categorydescription": "Pay Utility Bills here",
            "billerid": "AED",
            "billername": "Abuja Electricity Distribution Company Prepaid",
            "customerfield1": "Customer Metre Number",
            "customerfield2": "",
            "supportemail": "support@interswitchgroup.com",
            "paydirectProductId": "5161",
            "paydirectInstitutionId": "0",
            "narration": "AEDC Prepaid Payments",
            "shortName": "AEDC",
            "surcharge": "",
            "currencyCode": "566",
            "currencySymbol": "NGN",
            "customMessageUrl": "",
            "customSectionUrl": "",
            "logoUrl": "",
            "networkId": "",
            "productCode": "",
            "type": "",
            "url": ""
        }
    },

    getAEDCPaymentItemObject: () => {
        return {
            "categoryid": "1",
            "billerid": "AED",
            "isAmountFixed": false,
            "paymentitemid": "01",
            "paymentitemname": "AEDC Prepaid",
            "amount": "0",
            "code": "01",
            "currencyCode": "566",
            "currencySymbol": "NGN",
            "itemCurrencySymbol": "",
            "sortOrder": "0",
            "pictureId": "0",
            "paymentCode": "",
            "itemFee": "",
            "paydirectItemCode": ""
        }
    },

    validateCustomer: async (amountInMinor, customerId, phone, service) => {
        const pfkUserToken = req.headers['pfk-user-token']
        const amount = amountInMinor / 100

        if (amount < 1000) {
            return response.badRequest(res, { message: "Sorry, you cannot purchase AEDC units less than NGN1000 Value" })
        }

        if (!pfkUserToken || pfkUserToken === '') {
            return response.badRequest(res, { message: 'pfk-user-token is required in the request header' });
        }

        let url = `https://superpay.ng/api/public/live/initiate_transaction.json`;
        let verb = "POST";
        let validationResponse = null;

        let requestHeaders = {
            Authorization: pfkUserToken,
            "Content-Type": "application/json"
        };
        let validationRequest = {
            private_key: config.superpay.PRIVATE_KEY,
            token: config.superpay.TOKEN,
            service: service,
            mobile: phone,
            amount: amount,
            accountnumber: customerId
        };

        console.log("SUPERPAY VALIDATION REQUEST ====>", validationRequest)

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(validationRequest) };
        try {
            validationResponse = await requestPromise(requestOptions);
            const parsedValidationResponse = JSON.parse(validationResponse)
            console.log("SUPERPAY VALIDATION RESPONSE =============>", JSON.parse(validationResponse))
            
            if (parsedValidationResponse.status === "100" || parsedValidationResponse.status === "300") {
                // return response.badRequest(res, { message: parsedValidationResponse.message })
                return {
                    error: true,
                    errorType: 'badRequest',
                    data: { message: parsedValidationResponse.message }
                }
            }

            // return response.ok(res, parsedValidationResponse.message)
            // Everything was successful! Yipeee!!!
            return {
                error: false,
                errorType: '',
                data: parsedValidationResponse.message
            }
        } catch (error) {
            console.log("SUPERPAY VALIDATION Error ====>", error);
            return {
                error: true,
                errorType: 'error',
                data: error.message
            }
            // return response.error(res, { message: error.message })

            // return false
        }
    }
};
