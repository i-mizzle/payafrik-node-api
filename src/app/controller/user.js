'use strict';
const userHelper = require('./../helper/user');
const mailer = require('./../helper/mailer');
const response = require('./../responses');
const passport = require('passport');
const jwtService = require("./../services/jwtService");
const mongoose = require("mongoose");

const User = mongoose.model('User');
module.exports = {
    // login controller
    login: async (req, res) => {
        let user = await User.findOne({ username: req.body.username, confirmed: true });
        if (!user) {
            return response.conflict(res, { message: 'User not found or account has not been confirmed.'});
        }
        if(user.status === 'DISABLED') {
            return response.conflict(res, { message: 'This account is disabled and cannot be logged in.'});
        }
        passport.authenticate('local', async (err, user, info) => {
            if (err) { return response.error(res, err); }
            if (!user) { return response.unAuthorize(res, info); }
            let token = await new jwtService().createJwtToken({ id: user._id, username: user.username, userType: user.userType });

            var userDetails = user;
            delete userDetails.password;
            delete userDetails.confirmationCode;
            
            return response.ok(res, { 
                token, 
                userId: user._id,
                email: user.email,
                phone: user.phone,
                userType: user.userType
             });
        })(req, res);
    },
    signUp: async (req, res) => {
        try {
            let user = await User.findOne({ username: req.body.username });
            if (!user) {
                let user = new User(
                    { 
                        username: req.body.username,
                        email: req.body.email, 
                        phone: req.body.phone,
                        userType: req.body.userType
                    }
                );
                user.password = user.encryptPassword(req.body.password);
                user.confirmationCode = userHelper.generateRandomCode(35);

                await user.save();
                if(mailer.sendEmail(
                    {
                        mailTo: user.email,
                        subject: 'Welcome to Payafrik',
                        message: 'Follow this link to confirm your account<br> payafrik.io/activation/'+ user.confirmationCode
                    }
                )){
                    return response.created(res, {
                        email: user.email,
                        username: user.username,
                        phone: user.phone,
                        confirmationCode: user.confirmationCode
                    });
                }
                
            } else {
                return response.conflict(res, { message: 'Account already exists for email: '+ user.username});
            }
        } catch (error) {
            return response.error(res, error);
        }
    },
    confirm: async (req, res) => {
        try {
            let user = await User.findOne({ 
                confirmationCode: req.params.confirmationCode, 
                confirmed: false });
            if (user) {
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.address.addressLine = req.body.address.addressLine;
                user.address.location = req.body.address.location;
                // user.address.coordinates = userHelper.getAddressCoordinates() 
                user.confirmed = true;
                user.address.coordinates = await userHelper.getAddressCoordinates(req.body.address.addressLine + ', ' + req.body.address.location)
                await user.save();
                return response.ok(res, { user });
            } else {
                return response.conflict(res, { message: 'user not found or account already confirmed'});
            }
        } catch (error) {
            return response.error(res, error);
        }
    },
    me: async (req, res) => {
        try {
            let user = await userHelper.find({ _id: req.user.id });
            return response.ok(res, user);
        }
        catch (error) {
            return response.error(res, error);
        }
    },
    updateKyc: async (req, res) => {
        try {
            console.log(req.file);
            let user = await userHelper.find({ _id: req.user.id });
            user.kycDocs.push({
                documentType: req.body.documentType,
                documentS3Url: req.file.location,
                documentStatus: 'PENDING'
            })
            await user.save();
            return response.ok(res, { user });
        }
        catch (error) {
            return response.error(res, error);
        }
    }   

};
