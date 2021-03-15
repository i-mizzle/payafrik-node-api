'use strict';
const mongoose = require("mongoose");
const config = require("config");
const Transaction = mongoose.model('Transaction');
const Archive = mongoose.model('TransactionArchive');

module.exports = {
    createArchiveItem: async () => {

    },

    archiveTransactions: async (req, res) => {
        
    }
}