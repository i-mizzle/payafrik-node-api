'use strict';
const requestPromise = require("request-promise");
const response = require('./../responses');
const config = require("config");

module.exports = {
    sendMessage: async (messageObject) => {
        let url = `https://api.payafrik.io/notifications/send/sms/`;
        let verb = "POST";
        let smsResponse = null;        
        // set the message and send, if it's sent, update in notifications object as sent or set as failed
        let requestHeaders = {
            "Content-Type": "application/json",
            "X-PFK-TOKEN": config.payafrik.X_PFK_TOKEN
        };
        let requestBody = {
            recipient: messageObject.recipient,
            message: messageObject.messageBody
        }
        console.log("SEND SMS REQUEST ====>", requestBody)
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        try {
            smsResponse = await requestPromise(requestOptions);
            console.log("SEND SMS RESPONSE =============>", JSON.parse(smsResponse))
            return true
        } catch (error) {
            console.log("SEND SMS Error ====>", error);
            return false
        }
    }
}