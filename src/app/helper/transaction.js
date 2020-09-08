'use strict';
const mongoose = require('mongoose');
const response = require('./../responses');
const Transaction = mongoose.model('Transaction');
const requestPromise = require("request-promise");
const config = require("config");

module.exports = {
    createNewTransaction: async (username, userId, transactionPayload, failureObject, userToken) => {
        if (!failureObject) {
            failureObject = {}
        }
        try {
            let transaction = new Transaction(
                {
                    userId: userId,
                    username: username,
                    transactionStatus: transactionPayload.responseCodeGrouping,
                    pfkTransactionReference: transactionPayload.payafrikTransactionRef,
                    interswitchTransactionRef: transactionPayload.transactionRef,
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

    updateTransaction: async (updatePayload) => {
        try {
            let transaction = await Transaction.findOne({ _id: updatePayload.transactionId });
            transaction.status = updatePayload.status;

            await transaction.save();
            return transaction;
        } catch (error) {
            return response.error(res, 'transaction creation failed');
        }
    }
}
