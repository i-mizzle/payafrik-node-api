const requestPromise = require("request-promise");
const response = require('./../responses');
const config = require("config");
const userHelper = require('../helper/user');
const transactionHelper = require('../helper/transaction');

module.exports = {
    validateAEDCCustomer: async (req, res) => {
        const pfkUserToken = req.headers['pfk-user-token']
        const amount = req.body.amount / 100

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
            service: "AED",
            mobile: req.body.phone,
            amount: amount,
            accountnumber: req.body.metreNumber
        };

        console.log("AEDC VALIDATION REQUEST ====>", validationRequest)

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(validationRequest) };
        try {
            validationResponse = await requestPromise(requestOptions);
            const parsedValidationResponse = JSON.parse(validationResponse)
            console.log("AEDC VALIDATION RESPONSE =============>", JSON.parse(validationResponse))
            
            if (parsedValidationResponse.status === "100" || parsedValidationResponse.status === "300") {
                return response.badRequest(res, { message: parsedValidationResponse.message })
            }

            return response.ok(res, parsedValidationResponse.message)
        } catch (error) {
            console.log("AEDC VALIDATION Error ====>", error.message);
            return response.error(res, { message: error.message })
            // return false
        }

    },

    payForAEDC: async (req, res) => {
        // sendPaymentAdvice = async (customerId, paymentCode, mobileNumber, emailAddress, amount, requestReference) => {
        const pfkUserToken = req.headers['pfk-user-token']
        const amount = req.body.amount / 100
        if (!pfkUserToken || pfkUserToken === '') {
            return response.badRequest(res, { message: 'pfk-user-token is required in the request header' });
        }
        console.log('the amount---->', amount)
        let user = await userHelper.checkUserCanProceed(pfkUserToken, amount)
        if (!user.canProceed) {
            return response.conflict(res, { message: "User does not have enough tokens" });
        }
        const userId = user.userId
        const username = user.username
        let url = `https://superpay.ng/api/public/live/complete_transaction.json`;
        let verb = "POST";
        let paymentResponse = null;
        let requestHeaders = {
            // Authorization: userToken,
            "Content-Type": "application/json"
        };
        let paymentRequest = {
           private_key: config.superpay.PRIVATE_KEY,
           token: config.superpay.TOKEN,
           tid: req.body.tid
        };
        const requestRef = userHelper.generateRandomCode(8);
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(paymentRequest) };
        try {
            paymentResponse = await requestPromise(requestOptions);
            // adviceResponse = interswitchRequestAdapter.parseResponse(adviceResponse);
            const parsedPaymentResponse = JSON.parse(paymentResponse)
            console.log('parsed response-------===', parsedPaymentResponse)
            if (parsedPaymentResponse.status === "100" || parsedPaymentResponse.status === "300") {
                return response.badRequest(res, { message: parsedPaymentResponse.message })
            }
            parsedPaymentResponse.payafrikTransactionRef = requestRef;

            let tokenDeduction = await transactionHelper.deductUserTokens(pfkUserToken, amount, requestRef)
            if (!tokenDeduction) {
                // save the amount of tokens that need to be deducted
                let failureObject = {
                    tokenDeduction: {
                        status: false,
                        narration: "Token deduction failed"
                    },
                    amount: amount
                }
                await transactionHelper.createNewTransaction(username, userId, parsedPaymentResponse, failureObject, pfkUserToken)
                return response.error(res, { message: "Token deduction failed, amount blocked" })
            }
            await transactionHelper.createNewTransaction(username, userId, parsedPaymentResponse, {}, pfkUserToken)
            return response.ok(res, parsedPaymentResponse);
        } catch (error) {
            console.log(error.message);
            // throw error;
            return response.error(res, error);
        }
    },

    verifyAEDCPayment: async (req, res) => {
        let url = `https://superpay.ng/api/public/live/verify_transaction.json`;
        let verb = "POST";
        let verificationResponse = null;
        let requestHeaders = {
            "Content-Type": "application/json"
        };
        let verificationRequest = {
            private_key: config.superpay.PRIVATE_KEY,
            token: config.superpay.TOKEN,
            tid: req.body.tid,
            accountnumber: req.body.metreNumber,
            mobile: req.body.phone
        };
        console.log("AEDC VALIDATION REQUEST ====>", verificationRequest)
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(verificationRequest) };
        try {
            verificationResponse = await requestPromise(requestOptions);
            const parsedVerificationResponse = JSON.parse(verificationResponse)
            return response.ok(res, parsedVerificationResponse.message)
        } catch (error) {
            console.log("AEDC VALIDATION Error ====>", error.message);
            return response.error(res, { message: error.message })
            // return false
        }
    }
}