'use strict';
const mongoose = require('mongoose');
const response = require('./../responses');
const Transaction = mongoose.model('Transaction');
const requestPromise = require("request-promise");
const config = require("config");

module.exports = {
    createNewTransaction: async (transactionFor, username, userId, transactionAmount, transactionPayload, failureObject, userToken, res, channel) => {
        console.log('Transaction Amount++++', transactionAmount)
        if (!failureObject) {
            failureObject = {}
        }
        if (!channel) {
            channel = null
        }
        try {
            let transaction = new Transaction(
                {
                    userId: userId,
                    username: username,
                    transactionStatus: transactionPayload.responseCodeGrouping,
                    amount: +transactionAmount,
                    transactionFor: transactionFor,
                    pfkTransactionReference: transactionPayload.payafrikTransactionRef || transactionPayload.data.reference,
                    interswitchTransactionRef: transactionPayload.transactionRef,
                    channel: channel,
                    transactionData: transactionPayload.rechargePIN || transactionPayload.miscData,
                    tokenDeduction: failureObject.tokenDeduction,
                    tokenAmount: failureObject.amount
                }
            );
            let savedTransaction = await transaction.save();
            await module.exports.sendTransactionDetails(userToken, savedTransaction)
            return transaction;
        } catch (error) {
            console.log(error)
            return response.error(res, 'transaction creation failed');
        }
    },

    sendTransactionDetails: async (userToken, transaction) => {
        let url = `https://api.payafrik.io/transactions/transactions/webhook/`;
        let verb = "POST";
        let sendTransactionResponse = null;

        let requestHeaders = {
            // "X-PFK-TOKEN": userToken,
            "X-PFK-TOKEN": config.payafrik.X_PFK_TOKEN,
            "Content-Type": "application/json"
        };

        let requestBody = {
            data: transaction
        };
        
        console.log('TRANSACTION REQUEST BODY', requestBody)

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        try {
            sendTransactionResponse = await requestPromise(requestOptions);
            console.log("send transaction response ====>", sendTransactionResponse);
            return true
        } catch (error) {
            console.log("send transaction Error ====>", error.message);
            // return response.error(res, {message: error.message})
            return false
        }
    },

    deductUserTokens: async (userToken, amount, requestRef) => {
        let url = `https://api.payafrik.io/exchange/utilities/transfer/`;
        let verb = "POST";
        let deductionResponse = null;
    
        let requestHeaders = {
          Authorization: userToken,
          "Content-Type": "application/json"
        };
        // let deductionRequest = {
        //     "recipient":"254758462513",
        //     "requested_amount":amount,
        //     "wallet": "AfriToken",
        //     "memo":"Payment for mart item. Ref: " + requestRef
        // };

        let deductionRequest = {
            "recipient": "254758462513",
            "amount": amount,
            "currency":"AFRITOKEN",
            "memo": "Payment for mart item. Ref: " + requestRef,
            "address_type":"USERNAME"
          };
    
        console.log("deductionHEADERS ====>", requestHeaders)
        console.log("deductionURL ====>", url)
        console.log("deductionRequest ====>", deductionRequest)
      
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(deductionRequest) };
        try {
          deductionResponse = await requestPromise(requestOptions);
          console.log("deduction Error ====>", deductionResponse);
          return true
        } catch (error) {
          console.log("deduction Error ====>", error.message);
          // return response.error(res, {message: error.message})
          return false
        }
    },

    updateTransaction: async (updatePayload) => {
        try {
            let transaction = await Transaction.findOne({ _id: updatePayload.transactionId });
            transaction.status = updatePayload.status;

            await transaction.save();
            return transaction;
        } catch (error) {
            return response.error(res, 'transaction creation failed');
        }
    },

    deleteTransaction: (condition) => {
        return Transaction.remove(condition);
    },
}
