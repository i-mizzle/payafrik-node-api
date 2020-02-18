'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
// const bcrypt = require('bcrypt');
const transactionSchema = new mongoose.Schema({
    userId:{
        type: ObjectId, 
        ref: 'Users' 
    },
    transactionType: {
        type: String,
        enum : ['CASH','TOKEN','CRYPTO'],
        default: 'CASH'
    },
    transactionStatus: {
        type: String,
        enum : ['SUCCESSFUL','FAILED','PENDING'],
        default: 'PENDING'
    },
    transactionReference: {
        type: String,
    },
    channel: {
        type: String,
        enum : ['PAYSTACK','COINBASE','PAYAFRIK'],
        default: 'PENDING'
    },
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
