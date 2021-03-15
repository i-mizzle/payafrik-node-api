'use strict';
const response = require('./../responses');
const axios = require('axios');
const cryptoRandomString = require('crypto-random-string');
const config = require("config");
const sha512 = require("js-sha512")
const iRecharge = require("../helper/iRecharge");
const superpay = require("../helper/superpay");
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

    removeBillersWithAlternatives: (billers) => {
        const newBillersArray = []

        billers.forEach(element => {
            if(!config.billersWithDuplicates.includes(element.shortName)) {
                newBillersArray.push(element)
            }
        });

        return newBillersArray
    },

    getExternalBillerItems: (biller, source) => {
        const activeExternalBillers = config.activeExternalBillers
        if (activeExternalBillers.includes(biller)) {
            let billerPaymentItems = null 
            let allItems = null
            switch(source) {
                case 'superpay':
                    allItems = superpay.getPaymentItems(biller)
                    billerPaymentItems = allItems[biller]
                    break;
                case 'vatebra':
                    allItems = vatebra.getPaymentItems(biller)
                    billerPaymentItems = allItems[biller]
                    break;
                case 'irecharge':
                    allItems = iRecharge.getPaymentItems(biller)
                    break;
                default:
                // code block
            }
            billerPaymentItems = allItems[biller]
            return billerPaymentItems
        }
    },

    vendExternal: (biller, source) => {
        const activeExternalBillers = config.activeExternalBillers
        if (activeExternalBillers.includes(biller)) {
            let vendResponse = null 
            switch(source) {
                case 'superpay':
                    vendResponse = superpay.vendTokens(biller)
                    break;
                case 'vatebra':
                    vendResponse = vatebra.vendTokens(biller)
                    break;
                case 'irecharge':
                    vendResponse = iRecharge.vendTokens(biller)
                    break;
                default:
                // code block
            }
            return vendResponse
        }
    }
   
};
