'use strict';
const mailer = require('../helper/mailer');
const response = require('../responses');
const mongoose = require("mongoose");

const user = require('../../app/controller/user');
const transaction = require('../../app/controller/transaction');

module.exports = {
    transferToken: async (req, res) => {
        try {
            let transaction = new Transaction(
                { 

                }
            );
            await transaction.save();
            return response.created(res, { transactionDetails: transaction });
        } catch (error) {
            return response.error(res, error);
        }
    },

}