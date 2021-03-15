'use strict';
const response = require('./../responses');
const cryptoRandomString = require('crypto-random-string');
const config = require("config");
const sha512 = require("js-sha512")
const soapRequest = require('easy-soap-request');
const requestPromise = require("request-promise");
var xmlParser = require('xml2json');
const md5 = require('md5')

module.exports = {
    getVatebraBillers: () => {
        return [
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "EKEDC",
                "billername": "Eko Electricity Distribution Company Prepaid",
                "customerfield1": "Customer Metre Number",
                "narration": "EKEDC Payments",
                "shortName": "EKEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "EEDC",
                "billername": "Enugu Electricity Distribution Company",
                "customerfield1": "Customer Metre Number",
                "narration": "EEDC Payments",
                "shortName": "EEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "IBEDC",
                "billername": "IBEDC Payments",
                "customerfield1": "Customer Metre Number",
                "customerfield2": "",
                "narration": "IBEDC Payments",
                "shortName": "IBEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN",
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "IKEDC",
                "billername": "Ikeja Electricity Distribution Company Prepaid",
                "customerfield1": "Customer Metre Number",
                "narration": "IKEDC Prepaid Payments",
                "shortName": "IKEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN"
            }
        ]
    },

    getAEDCPaymentItemObject: () => {
        return {
            EKEDC: [
                {
                    "categoryid": "1",
                    "billerid": "EPP",
                    "isAmountFixed": false,
                    "paymentitemid": "01",
                    "paymentitemname": "EKEDC Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            EEDC: [
                {
                    "categoryid": "1",
                    "billerid": "BOB",
                    "isAmountFixed": false,
                    "paymentitemid": "01",
                    "paymentitemname": "EEDC Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            IBEDC: [
                {
                    "categoryid": "1",
                    "billerid": "IBP",
                    "isAmountFixed": false,
                    "paymentitemid": "01",
                    "paymentitemname": "IBEDC Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            IKEDC: [
                {
                    "categoryid": "1",
                    "billerid": "IKP",
                    "isAmountFixed": false,
                    "paymentitemid": "01",
                    "paymentitemname": "IKEDC Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
        }
    },

    sanitizeResult: (resultText) => {
        if (!resultText.includes(',')) {
            return resultText
        }
        const sanitizedObject = {}
        const exploded = resultText.split(',')

        exploded.forEach(element => {
            let key = element.split(':')[0].replace(/\s/g, '')
            if (key.charAt(0) === '0'){
                key = key.substring(3)
            }

            key = key.charAt(0).toLowerCase() + key.substring(1)
            let value = element.split(':')[1]

            if (value.charAt(0) === ' '){
                value = value.substring(1)
            }
            sanitizedObject[key] = value
        });
        return sanitizedObject
    },

    validateCustomer: async (metreNumber, service) => {
        let hashString = ''
        if (config.vatebra[service].HASH_ALGORITH === 'md5') {
            hashString = md5(metreNumber + config.vatebra[service].DEALER_CODE)
        } else {
            hashString = sha512(metreNumber + config.vatebra[service].DEALER_CODE)
        }
        // const hashString = sha512(metreNumber + config.vatebra[service].DEALER_CODE)
        const soapBody  =  `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><FetchCust xmlns="${config.vatebra[service].XMLNS}"><MeterNo>${metreNumber}</MeterNo><hashstring>${hashString}</hashstring><api_key>${config.vatebra[service].API_KEY}</api_key></FetchCust></soap:Body></soap:Envelope>`

        console.log('SOAP BODY++++++++>', soapBody)

        let url = config.vatebra[service].URL;
        
        const requestHeaders = {
            'Content-Type': 'text/xml',
            SOAPAction: config.vatebra[service].ACTION,
            Host: config.vatebra[service].HOST
        };
        console.log('HEADERS++++++++>', requestHeaders)

        try {
            let requestOptions = { uri: url, method: 'POST', headers: requestHeaders, body: soapBody };
            const validationResponse = await requestPromise(requestOptions);
            console.log('VALICATION RESPONSE++++++++>', validationResponse)
            return {
                error: false,
                errorType: '',
                data: module.exports.sanitizeResult(JSON.parse(xmlParser.toJson(validationResponse))['soap:Envelope']['soap:Body'].FetchCustResponse.FetchCustResult)
            }
        } catch (error) {
            return {
                error: true,
                errorType: 'error',
                data: JSON.parse(xmlParser.toJson(error.response.body)).errors.error[0]
            }
        }
    },

    postTransaction: async (metreNumber, service) => {
        let hashString = ''
        if (config.vatebra[service].HASH_ALGORITH === 'md5') {
            hashString = md5(metreNumber + config.vatebra[service].DEALER_CODE)
        } else {
            hashString = sha512(metreNumber + config.vatebra[service].DEALER_CODE)
        }
        // const hashString = sha512(metreNumber + config.vatebra[service].DEALER_CODE)
        const soapBody  =  

//         `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><PostTransaction xmlns="http://IKEDC_API/vproxy/">
//       <AccountNo>034509112501</AccountNo>
//       <amount>10000</amount>
//       <hashstring>11d614f36fe5e3d96db1d98d6eafaad85c7f64c7e4c5d35c24cc9029b62575e914f8dbaffebf0194509b734e6f898e860897e801d3b93c1defcc4ded77405bf3</hashstring>
//       <api_key>282139d6-5fc3-4079-ae9b-cb7cafc07a46</api_key>
//     </PostTransaction>
//   </soap:Body>
// </soap:Envelope>`

        console.log('SOAP BODY++++++++>', soapBody)

        let url = config.vatebra[service].URL;
        
        const requestHeaders = {
            'Content-Type': 'text/xml',
            SOAPAction: config.vatebra[service].ACTION,
            Host: config.vatebra[service].HOST
        };
        console.log('HEADERS++++++++>', requestHeaders)

        try {
            let requestOptions = { uri: url, method: 'POST', headers: requestHeaders, body: soapBody };
            const validationResponse = await requestPromise(requestOptions);
            console.log('VALICATION RESPONSE++++++++>', validationResponse)
            return {
                error: false,
                errorType: '',
                data: module.exports.sanitizeResult(JSON.parse(xmlParser.toJson(validationResponse))['soap:Envelope']['soap:Body'].FetchCustResponse.FetchCustResult)
            }
        } catch (error) {
            return {
                error: true,
                errorType: 'error',
                data: JSON.parse(xmlParser.toJson(error.response.body)).errors.error[0]
            }
        }
    }
};
