'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String
    },
    password: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        unique:true
    },
    emailConfirmationCode: {
        type: String,
    },
    phoneConfirmationCode: {
        type: String,
    },
    emailConfirmed:{
        type:Boolean,
        default: false
    },
    phoneConfirmed:{
        type:Boolean,
        default: false
    },
    dob: {
        type: Number,
        default: 0
    },
    userType: {
        type: String,
        enum : ['SYSTEM_ADMIN','USER'],
        default: 'USER'
    },
    status: {
        type: String,
        enum : ['ACTIVE','DISABLED'],
        default: 'ACTIVE'
    },
    address: {
        addressLine: { 
            type: String, 
        },
        location: { 
            type: String, 
        },
        coordinates: {
            type: String
        },
    },
    refreshToken: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
userSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});
userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
userSchema.methods.isValidPassword = function isValidPassword(password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', userSchema);
