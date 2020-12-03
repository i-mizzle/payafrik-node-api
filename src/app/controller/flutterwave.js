const requestPromise = require("request-promise");
const response = require('./../responses');
const userHelper = require('../helper/user');
const transactionHelper = require('../helper/transaction');
const interswitchRequestAdapter = require("../helper/interswitch-adpter");
const config = require('config')
const sms = require('../helper/sms');

// TO DO: REfactor transaction checks
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

let requestHeaders = {};



getBanks = async (req, res) => {
    let url = 'https://api.flutterwave.com/v3/banks/' + req.params.country;
    let verb = "GET";

    let banks = null;
    const requestHeaders = {
        Authorization: config.flutterwave.SECRET_KEY
    }
    let requestOptions = { uri: url, method: verb, headers: requestHeaders };
    //   console.log("Headers====>", requestHeaders)
    try {
        banks = await requestPromise(requestOptions);
        // console.log('BANKS====> ', banks)
        banks = interswitchRequestAdapter.parseResponse(banks);
        return response.ok(res, banks.data)
    } catch (error) {
        console.log('ERROR========> ', error.message);
        response.flutterwaveError(res, error);
    }
};

validateAccount = async (req, res) => {
    let url = 'https://api.flutterwave.com/v3/accounts/resolve';
    let verb = "POST";

    let validationResponse = null;

    const requestPayload = {
        account_number: req.body.accountNumber,
        account_bank: req.body.bankCode
    }

    const requestHeaders = {
        Authorization: config.flutterwave.SECRET_KEY,
        "Content-Type": "application/json"
    }

    let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestPayload) };

    console.log("Headers====>", requestHeaders)
    console.log("Reaquesters====>", requestOptions)
    try {
        validationResponse = await requestPromise(requestOptions);

        console.log('RESPONSE ===> ', validationResponse)
        validationResponse = interswitchRequestAdapter.parseResponse(validationResponse);
        return response.ok(res, validationResponse.data);
    } catch (error) {
        console.log(error.message);
        response.flutterwaveError(res, error);
    }
}

getTransferCharges = async (req, res) => {
    const amount = req.body.amount
    let url = 'https://api.flutterwave.com/v3/transfers/fee?amount=' + amount + '&currency=' + req.body.currency + '&type=account';
    let verb = "GET";
    let feeResponse = null;
    const requestHeaders = {
        Authorization: config.flutterwave.SECRET_KEY,
        "Content-Type": "application/json"
    }

    let requestOptions = { uri: url, method: verb, headers: requestHeaders };

    console.log("Headers====>", requestHeaders)
    console.log("Reaquesters====>", requestOptions)
    try {
        feeResponse = await requestPromise(requestOptions);

        console.log('RESPONSE ===> ', feeResponse)
        feeResponse = interswitchRequestAdapter.parseResponse(feeResponse);

        const flutterwaveCharge = feeResponse.data[0].fee
        const payafrikChargeMultiplier = config.payafrik.ACCOUNT_TRANSFER_CHARGE_MULTIPLIER
        const payafrikChargeCap = config.payafrik.ACCOUNT_TRANSFER_CHARGE_CAP

        console.log(amount, ' ', payafrikChargeMultiplier, ' ', payafrikChargeCap)
        let payafrikCharge = +amount * payafrikChargeMultiplier
        if (payafrikCharge > payafrikChargeCap) {
            payafrikCharge = 50
        }

        const returnData = {
            flwCharge: flutterwaveCharge,
            pfkCharge: payafrikCharge,
            chargeCurrency: feeResponse.data[0].currency,
            totalCharge: flutterwaveCharge + payafrikCharge
        }

        return response.ok(res, returnData);
    } catch (error) {
        console.log(error.message);
        response.flutterwaveError(res, error);
    }
};

getUserDetails = async (userToken, amount, req, res) => {
    let url = `https://api.payafrik.io/auth/user/profile/`;
    let verb = "GET";
    let userResponse = null;
  
    let requestHeaders = {
      Authorization: userToken,
      "Content-Type": "application/json"
    };
  
    let requestOptions = { uri: url, method: verb, headers: requestHeaders };
    try {
      userResponse = await requestPromise(requestOptions);
      const user = JSON.parse(userResponse)
      console.log('USER RESPONSE++++++++>>>>', user)
  
      if (user.balance >= amount) {
        return {
          userId: user.id,
          username: user.username,
          userFirstName: user.first_name,
          userLastName: user.last_name,
          userPhoneNumber: user.phone,
          canProceed: true
        }
      } else {
        return {
          userId: user.id,
          username: user.username,
          canProceed: false
        }
      }
    } catch (error) {
      console.log('THE ERROR========', error);
      return response.error(res, error)
    }
  };

transferFunds = async (req, res) => {
    const amount = +req.body.amount
    const charges = +req.body.charges
    const pfkUserToken = req.headers['pfk-user-token']

    let user = await getUserDetails(pfkUserToken, amount + charges)
    if (!user.canProceed) {
        return response.conflict(res, { message: "User does not have enough tokens" });
    }
    const userId = user.userId
    const username = user.username

    let url = 'https://api.flutterwave.com/v3/transfers';
    let verb = "POST";


    let transferResponse = null;
    const requestHeaders = {
        Authorization: config.flutterwave.SECRET_KEY,
        "Content-Type": "application/json"
    }

    const requestPayload = {
        account_bank: req.body.bankCode,
        account_number: req.body.accountNumber,
        amount: req.body.amount,
        narration: "withdrawal of " + amount +  " tokens withdrawal from payafrik",
        currency: req.body.currency,
        reference: userHelper.generateRandomCode(15),
        callback_url: "",
        // "callback_url": "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
        debit_currency: req.body.currency
    }
    let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestPayload) };

    console.log("Headers====>", requestHeaders)
    console.log("Reaquesters====>", requestOptions)
    try {
        transferResponse = await requestPromise(requestOptions);

        console.log('RESPONSE ===> ', transferResponse)
        transferResponse = interswitchRequestAdapter.parseResponse(transferResponse);

        await sms.sendMessage({
            recipient: username,
            messageBody: "Withdrawal of " + amount + " tokens from your payafrik account has been successfully initiated at the cost of " + charges + " tokens. You will receive an alert once deposit is made."
        })

        // transferResponse.pfkTransactionReference = transferResponse.reference
        console.log('------', transferResponse)
        await transactionHelper.createNewTransaction('TOKEN_WITHDRAWAL_TO_BANK_ACCOUNT', username, userId, Math.floor(amount + charges),  transferResponse, {}, pfkUserToken, res, 'FLUTTERWAVE')

        return response.ok(res, transferResponse.data);
    } catch (error) {
        console.log(error.message);
        response.flutterwaveError(res, error);
    }

}

getTransferById = async (req, res) => {
    let url = 'https://api.flutterwave.com/v3/transfers/' + req.params.transferId;
    let verb = "GET";

    let transfer = null;
    const requestHeaders = {
        Authorization: config.flutterwave.SECRET_KEY
    }
    let requestOptions = { uri: url, method: verb, headers: requestHeaders };
    //   console.log("Headers====>", requestHeaders)
    try {
        transfer = await requestPromise(requestOptions);
        console.log('TRANSFER====> ', transfer)
        transfer = interswitchRequestAdapter.parseResponse(transfer);
        return response.ok(res, transfer.data)
    } catch (error) {
        console.log('ERROR========> ', error.message);
        response.flutterwaveError(res, error);
    }
}

getAllTransfers = async (req, res) => {

}


module.exports = {
    getBanks: getBanks,
    validateAccount: validateAccount,
    transferFunds: transferFunds,
    getTransferCharges: getTransferCharges,
    getTransferById: getTransferById,
    getAllTransfers: getAllTransfers
};

