'use strict';
const response = require('./../responses');
// const nodemailer = require('nodemailer');
const mailgun = require("mailgun-js");
const DOMAIN = 'mg.airhaul.com.ng';
const mg = mailgun({
    apiKey: '840d174d30f0a00bd27eebd32a27162d-e470a504-e9575579', 
    domain: DOMAIN
});

const mongoose = require("mongoose");
const User = mongoose.model('User');
module.exports = {
    sendEmail: async (mailParams, req, res) => {
        const data = {
            from: 'Payafrik Admin <no-reply@payafrik.io>',
            to: mailParams.mailTo,
            subject: mailParams.subject,
            text: mailParams.message,
            // template: "accountconfirmation",
            // 'h:X-Mailgun-Variables': {}        
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });
    }
}