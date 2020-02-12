'use strict';
const userHelper = require('../helper/user');
const mailer = require('../helper/mailer');
const response = require('../responses');
const passport = require('passport');
const jwtService = require("../services/jwtService");
const mongoose = require("mongoose");
const axios = require('axios');

const Shipment = mongoose.model('Shipment');
module.exports = {
    create: async (req, res) => {
        try {
            let shipment = new Shipment(
                { 
                    shipmentOwner: req.user.id, 
                    shipmentDestination: req.body.shipmentDestination,
                    shipmentSource: req.body.shipmentSource,
                    handlingInstructions: req.body.handlingInstructions,
                    shipmentCost: req.body.shipmentCost,
                    items: req.body.items
                }
            );
            await shipment.save();
            return response.created(res, { shipmentDetails: shipment });
        } catch (error) {
            return response.error(res, error);
        }
    },
    acceptShipment: async (req, res) => {
        if (req.user.userType !== "AIRLINE_ADMIN") {
            return response.conflict(res, { message: 'Only an airline administrator can perform this action'});
        }
        try {
            let shipment = await Shipment.findOne(
                { 
                    _id: req.params.shipmentId,  
                }
            );
            if(shipment){
                shipment.airline = req.body.airlineId
                shipment.status = 'ACCEPTED'
                shipment.eta = new Date(req.body.eta)
                await shipment.save();
                return response.ok(res, { message: 'shipment accepted by airline' });
            }
        } catch (error) {
            return response.error(res, error);
        }
    },
    fetch: async (req, res) => {
        try{
            let shipments = await Shipment.find();
            return response.ok(res, { shipments: shipments });
        } catch(error) {
             response.error(res, error);
        }
    },
    fetchOne: async (req, res) => {
        try{
            let shipment = await Shipment.findOne({ _id: req.params.shipmentId });
            return response.ok(res, { shipmentDetails: shipment });
        } catch(error) {
             response.error(res, error);
        }
    }
}