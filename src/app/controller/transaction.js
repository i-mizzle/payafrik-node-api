'use strict';
const requestPromise = require("request-promise");
const mailer = require('../helper/mailer');
const response = require('../responses');
const mongoose = require("mongoose");
// const { config } = require("chai");
const config = require("config");
const Transaction = mongoose.model('Transaction');

module.exports = {
    create: async (req, res) => {
        try {
            let transaction = new Transaction(
                { 
                    username: req.body.username,
                    transactionType: req.body.transactionType,
                    transactionStatus: req.body.transactionStatus,
                    pfkTransactionReference: req.body.pfkTransactionReference,
                    interswitchTransactionRef: req.body.interswitchTransactionRef,
                    channel: req.body.channel,
                    transactionFor: req.body.transactionFor,
                    amount: req.body.amount,
                    channelResponse: req.body.channelResponse
                }
            );
            await transaction.save();
            return response.created(res, { transactionDetails: transaction });
        } catch (error) {
            return response.error(res, error);
        }
    },
    
    pushTransaction: async (transaction) => {
        let url = 'https://api.payafrik.io/transactions/transactions/webhook/';
        let verb = "POST";
        let queryResponse = null;
        let requestHeaders = {
            "Content-Type": "application/json",
            "X-PFK-TOKEN": config.payafrik.X_PFK_TOKEN
        };

        console.log('ze headers==== ', requestHeaders)
        let requestBody = {data: transaction}
      
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        try {
          queryResponse = await requestPromise(requestOptions);
        //   queryResponse = interswitchRequestAdapter.parseResponse(queryResponse);
            console.log('SUCCESSFUL PUSH+++ ', queryResponse)
        //   return response.ok(res, queryResponse);
          return true;
        } catch (error) {
          console.log('FAILED PUSH+++ ', error.message);
        //   return response.error(res, error);
          return false;
        }
    },

    updateTransaction: async (req, res) => {
        try {
            let transaction = await Transaction.findOne(
                { 
                    pfkTransactionReference: req.params.payafrikTransactionRef,  
                }
            );
            if(transaction){
                transaction.interswitchTransactionRef = req.body.interswitchTransactionRef || null
                transaction.transactionStatus = req.body.transactionStatus || null
                transaction.channelResponse = req.body.channelResponse || null
                await transaction.save();
                const transactionPushed = await module.exports.pushTransaction({
                    transactionType: transaction.transactionType,
                    transactionStatus: transaction.transactionStatus,
                    pfkTransactionReference: transaction.pfkTransactionReference,
                    interswitchTransactionRef: transaction.interswitchTransactionRef,
                    channel: transaction.channel,
                    transactionFor: transaction.transactionFor,
                    amount: transaction.amount,
                    channelResponse: transaction.channelResponse
                })
                
                if (transactionPushed){
                    return response.ok(res, { message: 'transaction has been updated' });
                }
            } else {
                return response.notFound(res, {message: 'transaction not found'});
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
        // if (req.user.userType !== "SYSTEM_ADMIN" && req.user.userId !== req.params.userId) {
        //     return response.conflict(res, { message: 'Sorry, you are not authorized to view these transactions'});
        // }
        try{
            let transactions = await Transaction.find({ username: req.user.username });
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