'use strict';
const response = require('./../responses');
// const nodemailer = require('nodemailer');
const mailgun = require("mailgun-js");
const config = require("config");
// const DOMAIN = 'mg.airhaul.com.ng';
const mg = mailgun({
    apiKey: config.mailgun.API_KEY, 
    domain: config.mailgun.DOMAIN
});


module.exports = {
    sendEmail: (mailParams, req, res) => {
        const data = {
            from: 'Payafrik Ltd <no-reply@payafrik.io>',
            to: mailParams.receiverEmail,
            subject: 'Your Token Purchase on Payafrik.io',
            template: 'payment_receipt',
            "h:X-Mailgun-Variables": JSON.stringify({
                paidAmount: mailParams.paidAmount,
                userName: mailParams.userName,
                invoiceNumber: mailParams.invoiceNumber,
                paymentDate: mailParams.paymentDate,
                tokenCost: mailParams.tokenCost,
                charges: mailParams.charges
            })
        };
        mg.messages().send(data, function (error, body) {
            if(error){
                console.log('MAILER ERROR++++', error);
            }
            console.log('MAILER RESPONSE++++', body);
        });
    }
}