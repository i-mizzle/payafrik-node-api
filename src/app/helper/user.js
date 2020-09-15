'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const NodeGeocoder = require('node-geocoder');
const config = require("config");

module.exports = {
    deleteUser: (condition) => {
        // return User.remove(condition);
    },
    find: (condition) => {
        return User.find(condition, { password: 0, __v: 0 });
    },
    generateRandomCode: (length, type) => {
        if (!type || type === '') type = 'alphanumeric'
        var result           = '';
        let characters       = '';
        if (type === 'alphanumeric'){
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            // add date string at the beginning of the result
            result = Date.now()
        } else {
            characters = '0123456789';
        }
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    getAddressCoordinates: async (address) => {
        const options = {
            provider: 'google',
            // Optional depending on the providers
            // httpAdapter: 'https', // Default
            apiKey: config.google.GEOCODING_API_KEY, // for Mapquest, OpenCage, Google Premier
            // formatter: null         // 'gpx', 'string', ...
        };
        const geocoder = NodeGeocoder(options);
        // geocoder.geocode(address)
        // .then(function(res) {
        //     console.log('GEOCODER RESPONSE ++++++++++', res[0].latitude + ', ' + res[0].longitude);
        //     return res[0].latitude + ', ' + res[0].longitude
        // })
        // .catch(function(err) {
        //     console.log('GEOCODER ERROR ++++++++++', err);
        //     return
        // });

        try{
            let coordinateData = await geocoder.geocode(address);
                console.log(coordinateData)
                return coordinateData[0].latitude + ', ' + coordinateData[0].longitude
        } catch (err){
            console.log('GEOCODER ERROR ++++++++++', err);
            return
        }
    }

};
