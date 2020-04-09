'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
// const bcrypt = require('bcrypt');
const transactionSchema = new mongoose.Schema({
    userId:{
        type: String
    },
    username:{
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
    },
    interswitchTransactionRef: {
        type: String
    },
    transactionData: {
        type: String
    },
    channel: {
        type: String,
        enum : ['PAYSTACK','COINBASE','PAYAFRIK'],
        default: 'PAYAFRIK'
    },
    tokenDeduction: {
        status: {
            type: Boolean,
            default: true
        },
        narration: {
            type: String
        }
    },
    tokenAmount: {
        type: Number
    }
      
}, {
    timestamps: true
});
transactionSchema.set('toJSON', {
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
module.exports = mongoose.model('Transaction', transactionSchema);
