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
        type: String,
        unique: true
    },
    phone: {
        type: String,
        unique:true,
        trim: true
    },
    password: {
        type: String,
    },
    confirmationCode: {
        type: String,
    },
    tokens: {
        type: Number,
        default: 0
    },
    dob: {
        type: Number,
        default: 0
    },
    confirmed:{
        type:Boolean,
        default: false
    },
    userType: {
        type: String,
        enum : ['SYSTEM_ADMIN','USER'],
        default: 'USER'
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
    }
    ,
    kycDocs: [
        {
            documentType: { 
                type: String, 
                enum : ['ID','CERTIFICATE']
            },
            documentS3Url: { 
                type: String, 
            },
            documentStatus: {
                type: String,
                enum : ['APPROVED','PENDING','REJECTED'],
                default: 'PENDING'
            },
        }
    ],
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
