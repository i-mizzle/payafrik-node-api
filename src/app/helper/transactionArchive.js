'use strict';
const mongoose = require('mongoose');
const transactionHelper = require('../helper/transaction');
const TransactionArchive = mongoose.model('Transaction');

module.exports = {
    createArchiveEntry: async (archiveItem) => {
        let entry = new TransactionArchive(archiveItem);
        let savedEntry = await entry.save();
        try {
            await transactionHelper.deleteTransaction(archiveItem)
            return {
                success: true,
                entry: savedEntry,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                error: error
            }
        }
    }
}