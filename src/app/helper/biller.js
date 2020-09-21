'use strict';
const response = require('./../responses');
const axios = require('axios');
const cryptoRandomString = require('crypto-random-string');
const config = require("config");
const sha512 = require("js-sha512")

module.exports = {
    encodeBase64: (clientId, InterswitchSecret) => {
     return Buffer.from(clientId+':'+InterswitchSecret).toString('base64')
    },

    getNonce: () =>{
        // return cryptoRandomString({length: 64});
        return cryptoRandomString({length: 64});
    },

    getInterswitchAccessToken: async (authHeader, req, res) => {
        let requestConfig = {
            headers: { "Authorization": "Basic " + authHeader, "Content-Type": "application/json" }
        }
        let requestBody = {
            "grant_type":"client_credentials"
        }
        try {
            let tokenResponse = await axios.post('https://sandbox.interswitchng.com/passport/oauth/token', requestBody, requestConfig);
            return tokenResponse.data.access_token
        } catch (error) {
            return response.error(res, error);
        }
    },

    getSignature: (verb, url, timestamp, nonce) => {
        let signature = sha512( verb + '&' + encodeURIComponent(url) + '&' + timestamp  + '&' + nonce  + '&' + config.interswitch.INTERSWITCH_CLIENT_ID  + '&' + config.interswitch.INTERSWITCH_SECRET );
        return signature
    },

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
            "logoUrl": "q.gif",
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
    }
   
};
