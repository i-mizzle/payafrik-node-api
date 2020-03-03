'use strict';
const mailer = require('../helper/mailer');
const response = require('../responses');
const mongoose = require("mongoose");
const Transaction = mongoose.model('Transaction');
module.exports = {
    create: async (req, res) => {
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
    updateTransaction: async (req, res) => {
        // if (req.user.userType !== "AIRLINE_ADMIN") {
        //     return response.conflict(res, { message: 'Only an airline administrator can perform this action'});
        // }
        try {
            let transaction = await Transaction.findOne(
                { 
                    _id: req.params.transactionId,  
                }
            );
            if(transaction){
                // shipment.airline = req.body.airlineId
                // shipment.status = 'ACCEPTED'
                // shipment.eta = new Date(req.body.eta)
                await transaction.save();
                return response.ok(res, { message: 'transaction has been updated' });
            }
        } catch (error) {
            return response.error(res, error);
        }
    },
    fetch: async (req, res) => {
        try{
            let transactions = await Transaction.find();
            return response.ok(res, { transactions: transactions });
        } catch(error) {
             response.error(res, error);
        }
    },
    fetchForUser: async (req, res) => {
        if (req.user.userType !== "SYSTEM_ADMIN" && req.user.userId !== req.params.userId) {
            return response.conflict(res, { message: 'Sorry, you are not authorized to view these transactions'});
        }
        try{
            let transactions = await Transaction.find({ userId: req.params.userId });
            return response.ok(res, { transactions: transactions });
        } catch(error) {
             response.error(res, error);
        }
    },
    
    fetchOne: async (req, res) => {
        try{
            let transaction = await Transaction.findOne({ _id: req.params.transactionId });
            return response.ok(res, { transactionDetails: transaction });
        } catch(error) {
             response.error(res, error);
        }
    }
}