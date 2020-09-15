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
        let user = await User.findOne({ username: req.body.username, phoneConfirmed: true });
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
            let user = await User.findOne({ username: req.body.phone });
            if (user) {
                return response.conflict(res, { message: 'Account already exists for: ' + user.username + ', Please login or choose another'});
            } else {
                let user = new User(
                    { 
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        username: req.body.phone,
                        phone: req.body.phone,
                        userType: req.body.userType
                    }
                );
                user.password = user.encryptPassword(req.body.pin);
                // user.emailConfirmationCode = userHelper.generateRandomCode(35);
                user.phoneConfirmationCode = userHelper.generateRandomCode(6, 'numeric');
                await user.save();   
                return response.ok(res, user)
            }
        } catch (error) {
            return response.error(res, error);
        }
    },
    confirm: async (req, res) => {
        try {
            if (req.params.confirmationMode === 'phone') {
                let user = await User.findOne({ 
                    phoneConfirmationCode: req.body.confirmationCode, 
                    phoneConfirmed: false 
                });
                if(user) {
                    user.phoneConfirmed = true;
                    await user.save();
                    return response.ok(res, user );
                } else {
                    return response.conflict(res, { message: 'user not found or account already confirmed'});
                }
            } else {
                let user = await User.findOne({ 
                    emailConfirmationCode: req.body.confirmationCode, 
                    emailConfirmed: false 
                });
                if (user) {
                    user.emailConfirmation = true;
                    await user.save();
                    return response.ok(res, user);
                } else {
                return response.conflict(res, { message: 'user not found or account already confirmed'});
                }
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
    // Admin only
    deactivateAccount() {

    },
    // Admin only
    activateAccount() {

    }
};
