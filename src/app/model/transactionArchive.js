'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
// const bcrypt = require('bcrypt');
const transactionArchiveSchema = new mongoose.Schema({
    transactionId: {
        type: String
    },
    userId:{
        type: String
    },
    username:{
        type: String,
    },
    receiptEmail:{
        type: String,
    },
    transactionType: {
        type: String,
        enum : ['CASH','TOKEN','CRYPTO'],
        default: 'TOKEN'
    },
    transactionStatus: {
        type: String,
        enum : ['SUCCESSFUL','FAILED','PENDING'],
        default: 'PENDING'
    },
    pfkTransactionReference: {
        type: String,
        unique:true,
    },
    interswitchTransactionRef: {
        type: String
    },
    transactionData: {
        type: String
    },
    channel: {
        type: String,
        enum : ['INTERSWITCH', 'PAYSTACK', 'COINBASE', 'FLUTTERWAVE', 'SUPERPAY'],
        default: 'INTERSWITCH'
    },
    transactionFor: {
        type: String,
        enum : ['TOKEN_PURCHASE', 'COIN_PURCHASE', 'MART_PURCHASE_VIA_TOKEN', 'TOKEN_WITHDRAWAL_TO_BANK_ACCOUNT'],
        default: 'TOKEN_PURCHASE'
    },
    currency: {
        type: String
    },
    amount: {
        type: Number
    },
    pushStatus: {
        type: Boolean,
        default: false
    },
    channelResponse: {}      
}, {
    timestamps: true
});
transactionArchiveSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});
// userSchema.methods.encryptPassword = (password) => {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
// };
// userSchema.methods.isValidPassword = function isValidPassword(password) {
//     return bcrypt.compareSync(password, this.password);
// };
module.exports = mongoose.model('TransactionArchive', transactionArchiveSchema);
