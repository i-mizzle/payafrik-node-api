'use strict';
const billerHelper = require('./../helper/biller');
const requestPromise = require("request-promise");
const response = require('./../responses');
const passport = require('passport');
const jwtService = require("./../services/jwtService");
const mongoose = require("mongoose");
const User = mongoose.model('User');
const config = require("config");
const axios = require('axios');


// const NodeCache = require( "node-cache" );
// const myCache = new NodeCache();
module.exports = {
    getBillerCategories: async (req, res) => {
        try {
            let authHeader =  billerHelper.encodeBase64(config.interswitch.INTERSWITCH_CLIENT_ID, config.interswitch.INTERSWITCH_SECRET)
            console.log('authHeader =====> ', authHeader)
            // let authToken = await billerHelper.getInterswitchAccessToken(authHeader)
            let timestamp = Date.now()
            let nonce = await billerHelper.getNonce()
            let signature = await billerHelper.getSignature('get', 
                'https://sandbox.interswitchng.com/api/v2/quickteller/categorys', 
                timestamp, 
                nonce
            )

            let requestConfig = {
                headers: { 
                    "Authorization": "InterswitchAuth " + authHeader, 
                    "Content-Type": "application/json", 
                    "Signature": signature,
                    "Nonce": nonce,
                    "Timestamp": timestamp,
                    "SignatureMethod": "SHA512"
                }
            }

            console.log('REQUEST CONFIGS ===================>', requestConfig)

            // let tokenResponse = await axios.post('https://sandbox.interswitchng.com/passport/oauth/token', requestBody, requestConfig);
            // let billerCategoriesResponse = await axios.get('https://sandbox.interswitchng.com/api/v2/quickteller/categorys', requestConfig);
            // let billerCategoriesResponse = await axios.get('https://sandbox.interswitchng.com/api/v2/quickteller/categorys');

            axios.get('https://sandbox.interswitchng.com/api/v2/quickteller/categorys', requestConfig)
                .then((response) => {
                    console.log('RESPONSE=======================>', response);
                    return response.ok(res, response.data)
                })
                .catch((error) => {
                    console.log('ERRORS=======================>', error);
                    return response.error(res, error);
                }); 

            // console.log( 'Response +++++++++++++++++++++++', billerCategoriesResponse);
            // return response.ok(res, { 
            //     authHeader: authHeader,
            //     timestamp: timestamp,
            //     nonce: nonce,
            //     signature: signature
            // });

            // return response.ok(res, billerCategoriesResponse.data)
        } catch (error) {
            return response.error(res, error);
        }
    },

    // getBillers: async (req, res) => {
    //     try {
           
    //     } catch (error) {
    //         return response.error(res, error);
    //     }
    // },
    // getBillersByCategory: async (req, res) => {
    //     try {
           
    //     } catch (error) {
    //         return response.error(res, error);
    //     }
    // },
    // getBillerPaymentItems: async (req, res) => {
    //     try {
           
    //     } catch (error) {
    //         return response.error(res, error);
    //     }
    // },
}