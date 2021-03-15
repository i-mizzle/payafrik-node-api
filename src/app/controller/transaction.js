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
            console.log(req.body)
            let transaction = new Transaction(
                { 
                    username: req.body.username,
                    transactionType: req.body.transactionType,
                    receiptEmail: req.body.receiptEmail || 'info@payafrik.io',
                    transactionStatus: req.body.transactionStatus,
                    pfkTransactionReference: req.body.pfkTransactionReference,
                    interswitchTransactionRef: req.body.interswitchTransactionRef,
                    channel: req.body.channel,
                    transactionFor: req.body.transactionFor,
                    currency: req.body.currency,
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
    
    pushTransaction: async (req, transaction) => {
        console.log('the user in transaction push', req.user)
        let url = 'https://api.payafrik.io/transactions/transactions/webhook/';
        let verb = "POST";
        let queryResponse = null;
        let requestHeaders = {
            "Content-Type": "application/json",
            "X-PFK-TOKEN": config.payafrik.X_PFK_TOKEN
        };

        let requestBody = {data: transaction}
      
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        try {
          queryResponse = await requestPromise(requestOptions);
        //   queryResponse = interswitchRequestAdapter.parseResponse(queryResponse);
            console.log('SUCCESSFUL PUSH+++ ', JSON.parse(queryResponse).data)
        //   return response.ok(res, queryResponse);
          return {success: true, error: null, data: JSON.parse(queryResponse).data};
        } catch (error) {
          console.log('FAILED PUSH+++ ', JSON.parse(error.error));
        //   return response.error(res, error);
          return {
              success: false, 
              error: JSON.parse(error.error)
            };
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
                if (!transaction.pushStatus && (!transaction.webhookTransactionId || transaction.webhookTransactionId === '')){
                    transaction.interswitchTransactionRef = req.body.interswitchTransactionRef || null
                    transaction.transactionStatus = req.body.transactionStatus || null
                    transaction.channelResponse = req.body.channelResponse || null
                    const transactionPushed = await module.exports.pushTransaction(req, {
                        username: transaction.username,
                        transactionType: transaction.transactionType,
                        transactionStatus: transaction.transactionStatus,
                        pfkTransactionReference: transaction.pfkTransactionReference,
                        interswitchTransactionRef: transaction.interswitchTransactionRef,
                        channel: transaction.channel,
                        transactionFor: transaction.transactionFor,
                        currency: transaction.currency,
                        amount: transaction.amount,
                        channelResponse: transaction.channelResponse
                    })
                    if (transactionPushed.success && req.body.transactionStatus === 'SUCCESSFUL'){
                        let mailParams = {
                            receiverEmail: transaction.receiptEmail,
                            paidAmount: transaction.amount,
                            userName: req.user.name,
                            invoiceNumber: transaction.pfkTransactionReference,
                            paymentDate: new Date(),
                            tokenCost: transaction.amount,
                            charges: '0'
                        }
                        // mailer.sendEmail(mailParams)
                        transaction.pushStatus = true
                        transaction.webhookTransactionId = transactionPushed.data.webhook_trx_id
                        const saved = await transaction.save()
                        console.log('THE TRANSACTION TO SAVE-----', saved)
                        return response.ok(res, { message: 'transaction has been updated' });
                    } else {
                        console.log('8347609850923423========', transactionPushed)
                        return response.error(res, {message: transactionPushed.error.msg})
                    }
                } else {
                    return response.conflict(res, {message: 'This transaction has already been settled'})
                }
            } else {
                return response.notFound(res, {message: 'transaction not found'});
            }
        } catch (error) {
            return response.error(res, error);
        }
    },
    fetch: async (req, res) => {
        const resPerPage = req.params.itemsPerPage || 10; // results per page
        const page = req.params.page || 1; // Page 
        try{
            const transactions = await Transaction.find()
            .skip((resPerPage * page) - resPerPage)
            .limit(resPerPage);
            const transactionsCount = await Transaction.count()
            return response.ok(res, { 
                count: transactionsCount,
                currentPage: page,
                pages: Math.ceil(transactionsCount/resPerPage),
                perPage: resPerPage,
                transactions: transactions.reverse()
            });
        } catch(error) {
             response.error(res, error);
        }
    },

    fetchForUser: async (req, res) => {
        const resPerPage = req.params.itemsPerPage || 10; // results per page
        const page = req.params.page || 1; // Page 
        try{
            const transactions = await Transaction.find({ username: req.user.username })
            .skip((resPerPage * page) - resPerPage)
            .limit(resPerPage);
            const transactionsCount = await Transaction.count({ username: req.user.username })
            return response.ok(res, { 
                count: transactionsCount,
                currentPage: page,
                pages: Math.ceil(transactionsCount/resPerPage),
                perPage: resPerPage,
                transactions: transactions.reverse()
            });
        } catch(error) {
             response.error(res, error);
        }
    },

    searchTransactions: async (req, res) => {
        const query = req.params.searchQuery
        try{
            const filtered = await Transaction.find({
                "$or": [
                    { username: { '$regex': query, '$options': 'i' } },
                    { channel: { '$regex': query, '$options': 'i' } },
                    { pfkTransactionReference: { '$regex': query, '$options': 'i' } }
                ]
            })
            return response.ok(res, { results: filtered.reverse() });
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