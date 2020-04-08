'use strict';
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

module.exports = {
    createNewTransaction: async (username, userId, transactionPayload) => {
        try {
            let transaction = new Transaction(
                { 
                    userId: userId,
                    username: username,
                    transactionStatus: transactionPayload.responseCodeGrouping,
                    pfkTransactionReference: transactionPayload.payafrikTransactionRef,
                    interswitchTransactionRef: transactionPayload.transactionRef,
                    transactionData: transactionPayload.rechargePIN || transactionPayload.miscData
                }
            );

            await transaction.save();
            return transaction;
        } catch (error) {
            return response.error(res, 'transaction creation failed');
        }
    },
    
    updateTransaction: async (updatePayload) => {
        try {
            let transaction = await Transaction.findOne({ _id: updatePayload.transactionId});
            transaction.status = updatePayload.status;
            
            await transaction.save();
            return  transaction;
        } catch (error) {
            return response.error(res, 'transaction creation failed');
        }
    }
}