'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
// const bcrypt = require('bcrypt');
const transactionSchema = new mongoose.Schema({
    shipmentOwner:{
        type: ObjectId, 
        ref: 'Users' 
    },
    shipmentSource: {
        type: String,
    },
    shipmentDestination: {
        type: String,
    },
    handlingInstructions: {
        type: String,
    },
    status: {
        type: String,
        enum : ['PENDING','ACCEPTED','IN_TRANSIT','DELIVERED','REJECTED','IN_DISPUTE','DELIVERY_CONFIRMED'],
        default: 'PENDING'
    },
    airline: {
        type: ObjectId, 
        ref: 'Airlines' 
    },
    eta: {
        type: Date
    },
    desiredShipmentDate: {
        type: String,
    },
    shipmentCost: {
        type: Number,
    },
    paid: {
        type: Boolean,
        default: false
    },
    deliveryConfirmedBy:{
        name: {
            type:String
        },
        phone: {
            type: String
        },
        email:{
            type: String
        }
    },
    items:[ 
        {
            weight: { 
                type: Number 
            },
            weightUnit: { 
                type: String 
            },
            itemName: {
                type: String
            },
            quantity: {
                type: Number
            },
            quantityUnit: {
                type:String
            }
        }
    ],
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
