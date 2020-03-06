'use strict';
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

module.exports = {
    createNewTransaction: (transactionPayload) => {
        try {
            let transaction = new Transaction(
                { 

                }
            );
            await transaction.save();
            return  transaction;
        } catch (error) {
            return response.error(res, 'transaction creation failed');
        }
    },
    updateTransaction: (updatePayload) => {
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