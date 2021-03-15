const config = require("config");
const requestPromise = require("request-promise");
const userHelper = require('./user');
const transactionHelper = require('../helper/transaction');

module.exports = {
    validateCustomer: async (customerId, billerId) => {
        const referenceCode = userHelper.generateRandomCode(12, true)
        const hashCipher = config.iRecharge.VENDOR_CODE+"|"+referenceCode+"|"+customerId+"|"+billerId+"|"+config.iRecharge.PUBLIC_KEY
        
        const crypto = require('crypto')
        const text = hashCipher
        const key = config.iRecharge.PRIVATE_KEY

        const hash = crypto.createHmac('sha1', key)
        .update(text)
        .digest('hex')
        
        let url = `https://irecharge.com.ng/pwr_api_sandbox/v2/get_meter_info.php?vendor_code=${config.iRecharge.VENDOR_CODE}&reference_id=${referenceCode}&meter=${customerId}&disco=${billerId}&response_format=json&hash=${hash}`;

        let verb = "GET";
        let validationResponse = null;

        let requestHeaders = {
            "Content-Type": "application/json"
        };

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
        try {
            validationResponse = await requestPromise(requestOptions);
            if (validationResponse.charAt(0) !== '{') {
                validationResponse = JSON.parse(validationResponse.substring(1))
            }
            if (validationResponse.status !== "00") {
                return {
                    error: true,
                    errorType: 'badRequest',
                    data: { message: validationResponse.message }
                }
            }
            // Everything was successful! Yipeee!!!
            return {
                error: false,
                errorType: '',
                data: { 
                    transactionId: validationResponse.access_token,
                    transactionRef: referenceCode,
                    vendUrl: 'biller/post-transaction/IRECHARGE',
                    customer: validationResponse.customer
                }
            }
        } catch (error) {
            console.log("iRECHARGE VALIDATION Error ====>", error);
            return {
                error: true,
                errorType: 'error',
                data: error.message || error
            }
        }
    },

    vendTokens: async (amountInMinor, customerId, phone, email, tid, billerId) => {
        const pfkUserToken = req.headers['pfk-user-token']
        const amount = amountInMinor / 100
        if (amount < 1000) {
            return response.badRequest(res, { message: "Sorry, you cannot purchase AEDC units less than NGN1000 Value" })
        }
        if (!pfkUserToken || pfkUserToken === '') {
            return response.badRequest(res, { message: 'pfk-user-token is required in the request header' });
        }
        const crypto = require('crypto')
        const text = hashCipher
        const key = config.iRecharge.PRIVATE_KEY

        const hash = crypto.createHmac('sha1', key)
        .update(text)
        .digest('hex')

        let url = `https://irecharge.com.ng/pwr_api_sandbox/v2/vend_power.php?vendor_code=${config.iRecharge.VENDOR_CODE}&reference_id=${tid}&meter=${customerId}&access_token=${tid}&disco=${billerId}&phone=${phone}&email=${email}&response_format=json&hash=${hash}&amount=${amount}`;
        let verb = "GET";
        let vendResponse = null;
        let requestHeaders = {
            "Content-Type": "application/json"
        };
        console.log("iRECHARGE VENDING REQUEST ====>", url)
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
        try {
            vendResponse = await requestPromise(requestOptions);
            if (vendResponse.charAt(0) !== '{') {
                vendResponse = JSON.parse(vendResponse.substring(1))
            }
            console.log("iRECHARGE VENDING RESPONSE =============>", vendResponse)
            if (vendResponse.status !== "00") {
                // return response.badRequest(res, { message: parsedValidationResponse.message })
                return {
                    error: true,
                    errorType: 'badRequest',
                    data: { message: vendResponse.message }
                }
            }
            // Everything was successful! Yipeee!!!
            await transactionHelper.createNewTransaction('MART_PURCHASE_VIA_TOKEN', username, userId, amount, adviceResponse, {}, pfkUserToken, res, 'IRECHARGE')
            return {
                error: false,
                errorType: '',
                data: { vendResponse }
            }
        } catch (error) {
            console.log("iRECHARGE VENDING Error ====>", error);
            return {
                error: true,
                errorType: 'error',
                data: error.message
            }
        }
    },

    getWalletBalance: async () => {
        const pfkUserToken = req.headers['pfk-user-token']
        const hashCipher = ''
        // const hash = ''
        let url = `https://irecharge.com.ng/pwr_api_sandbox/v2/get_wallet_balance.php?response_format=json&vendor_code=${config.iRecharge.VENDOR_CODE}`;
        let verb = "GET";
        let balanceResponse = null;
        let requestHeaders = {
            "Content-Type": "application/json"
        };
        console.log("iRECHARGE WALLET BALANCE REQUEST ====>", url)
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(validationRequest) };
        try {
            balanceResponse = await requestPromise(requestOptions);
            const parsedBalanceResponse = JSON.parse(balanceResponse)
            console.log("iRECHARGE VENDING RESPONSE =============>", JSON.parse(balanceResponse))
            if (parsedValidationResponse.status === "100" || parsedValidationResponse.status === "300") {
                // return response.badRequest(res, { message: parsedValidationResponse.message })
                return {
                    error: true,
                    errorType: 'badRequest',
                    data: { message: parsedBalanceResponse }
                }
            }
            // Everything was successful! Yipeee!!!
            return {
                error: false,
                errorType: '',
                data: parsedBalanceResponse
            }
        } catch (error) {
            console.log("iRECHARGE VENDING Error ====>", error);
            return {
                error: true,
                errorType: 'error',
                data: error.message
            }
        }
    },

    queryTransaction: async () => {
        const url = 'https://irecharge.com.ng/pwr_api_sandbox/v2/vend_status.php?vendor_code=YOUR_VENDOR_CODE&type=airtime&access_token=181228580229&hash=c1a74170d432e74dc02bb833f6b83e493ef93457&response_format=json'
    },

    getIrecharcgeBillers: () => {
        return [
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "AEDC",
                "billername": "Abuja Electricity Distribution Company",
                "customerfield1": "Customer Metre Number",
                "narration": "AEDC Payments",
                "shortName": "AEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/AEDC"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "IKEBP",
                "billername": "Ikeja Electric Bill Payment",
                "customerfield1": "Customer Metre Number",
                "narration": "Ikeja Electric Bill Payments",
                "shortName": "IKEBP",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/IKEBP"

            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "ITP",
                "billername": "Ikeja Token Purchase",
                "customerfield1": "Customer Metre Number",
                "narration": "Ikeja Token Purchase",
                "shortName": "ITP",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/ITP"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "EKEDC",
                "billername": "Eko Electricity Disctribution Company",
                "customerfield1": "Customer Metre Number",
                "narration": "Eko Electricity Disctribution Company",
                "shortName": "EKEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/EKEDC"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "IBDP",
                "billername": "Ibadan Disco",
                "customerfield1": "Customer Metre Number",
                "narration": "Ibadan Electricity Disctribution Company",
                "shortName": "IBDP",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/IBDP"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "KEDCO",
                "billername": "Kano Electricity Distribution Company",
                "customerfield1": "Customer Metre Number",
                "narration": "Kano Electricity Distribution Company",
                "shortName": "KEDCO",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/KEDCO"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "KAEDC",
                "billername": "Kaduna Electricity Distribution Company",
                "customerfield1": "Customer Metre Number",
                "narration": "Kaduna Electricity Distribution Company",
                "shortName": "KAEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/KAEDC"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "JEDC",
                "billername": "Jos Electricity Distribution Company",
                "customerfield1": "Customer Metre Number",
                "narration": "Jos Electricity Distribution Company",
                "shortName": "JEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/JEDC"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "EEDC",
                "billername": "Enugu Electricity Distribution Company",
                "customerfield1": "Customer Metre Number",
                "narration": "Enugu Electricity Distribution Company",
                "shortName": "EEDC",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/EEDC"
            },
            {
                "categoryid": "1",
                "categoryname": "Utilities",
                "categorydescription": "Pay Utility Bills here",
                "billerid": "PHED",
                "billername": "Port Harcourt Electricity Distribution",
                "customerfield1": "Customer Metre Number",
                "narration": "Port Harcourt Electricity Distribution",
                "shortName": "PHED",
                "currencyCode": "566",
                "currencySymbol": "NGN",
                "itemsUrl": "biller/irecharge/PHED"
            }
        ]
    },

    getPaymentItems: () => {
        return {
            EEDC: [
                {
                    "categoryid": "1",
                    "billerid": "EEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "Enugu_Electricity_Distribution_Prepaid",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 50000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            AEDC: [
                {
                    "categoryid": "1",
                    "billerid": "AEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "AEDC",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 500000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                },
                {
                    "categoryid": "1",
                    "billerid": "AEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "AEDC_Postpaid",
                    "paymentitemname": "Postpaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1000,
                    "maximum": 21000000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            JEDC: [
                {
                    "categoryid": "1",
                    "billerid": "JEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "Jos_Disco",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "Jos_Disco",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 1000000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                },
                {
                    "categoryid": "1",
                    "billerid": "JEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "Jos_Disco_Postpaid",
                    "paymentitemname": "Postpaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 10000000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            KAEDC: [
                {
                    "categoryid": "1",
                    "billerid": "KAEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "Kaduna_Electricity_Disco",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                },
                {
                    "categoryid": "1",
                    "billerid": "KAEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "Kaduna_Electricity_Disco_Postpaid",
                    "paymentitemname": "Postpaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1000,
                    "maximum": 5000000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            KEDCO: [
                {
                    "categoryid": "1",
                    "billerid": "KEDCO",
                    "isAmountFixed": false,
                    "paymentitemid": "Kano_Electricity_Disco",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                },
                {
                    "categoryid": "1",
                    "billerid": "KEDCO",
                    "isAmountFixed": false,
                    "paymentitemid": "Kano_Electricity_Disco_Postpaid",
                    "paymentitemname": "Postpaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 500000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            IBDP: [
                {
                    "categoryid": "1",
                    "billerid": "IBDP",
                    "isAmountFixed": false,
                    "paymentitemid": "Ibadan_Disco_Prepaid",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1000,
                    "maximum": 200000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                },
                {
                    "categoryid": "1",
                    "billerid": "IBDP",
                    "isAmountFixed": false,
                    "paymentitemid": "Ibadan_Disco_Postpaid",
                    "paymentitemname": "Postpaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 300000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            EKEDC: [
                {
                    "categoryid": "1",
                    "billerid": "EKEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "Eko_Prepaid",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1100,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                },
                {
                    "categoryid": "1",
                    "billerid": "EKEDC",
                    "isAmountFixed": false,
                    "paymentitemid": "Eko_Postpaid",
                    "paymentitemname": "Postpaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1000,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            ITP: [
                {
                    "categoryid": "1",
                    "billerid": "ITP",
                    "isAmountFixed": false,
                    "paymentitemid": "Ikeja_Token_Purchase",
                    "paymentitemname": "Ikeja Token Purchase",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1000,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            IKEBP: [
                {
                    "categoryid": "1",
                    "billerid": "IKEBP",
                    "isAmountFixed": false,
                    "paymentitemid": "Ikeja_Electric_Bill_Payment",
                    "paymentitemname": "Ikeja Electric Bill Payment",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1000,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ],
            PHED: [
                {
                    "categoryid": "1",
                    "billerid": "PHED",
                    "isAmountFixed": false,
                    "paymentitemid": "PhED_Electricity",
                    "paymentitemname": "Prepaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 600,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                },
                {
                    "categoryid": "1",
                    "billerid": "PHED",
                    "isAmountFixed": false,
                    "paymentitemid": "PH_Disco",
                    "paymentitemname": "Postpaid",
                    "amount": "0",
                    "code": "01",
                    "currencyCode": "566",
                    "currencySymbol": "NGN",
                    "sortOrder": "0",
                    "pictureId": "0",
                    "minimum": 1000,
                    "maximum": 100000,
                    "fromInterswitch": false,
                    "validationUrl": ""
                }
            ]
        }
    }
}

