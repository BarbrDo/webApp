let barber = require('../models/barber');
let constantObj = require('./../constants.js');
let barber_service = require('../models/barber_service.js');
let objectID = require('mongodb').ObjectID;
let user = require('../models/User');
var mongoose = require('mongoose');

exports.getBarber = function(req, res) {
    var maxDistanceToFind = constantObj.ParamValues.radiusSearch;
    if (req.headers.device_latitude && req.headers.device_longitude) {
        var long = parseFloat(req.headers.device_longitude);
        var lati = parseFloat(req.headers.device_latitude);
        var maxDistanceToFind = 500000;
        res.status(200).send({
            "msg": "in progress",
            "data": "in progress"
        })
    } else {
        res.status(400).send({
            "msg": constantObj.messages.requiredFields
        })
    }
}

exports.editBarber = function(req, res) {
    var updateData = JSON.parse(JSON.stringify(req.body));
    updateData.modified_date = new Date();
    delete updateData._id;
    if ((req.files) && (req.files.length > 0)) {
        var userimg = [];
        for (var i = 0; i < req.files.length; i++) {
            if (req.files[i].fieldname == 'image') {
                updateData.image = req.files[i].filename;
            } else {
                var obj = {};
                obj.name = req.files[i].filename;
                userimg.push(obj);
            }
        }
        updateData.gallery = userimg;
    }
    
    barber.update({
        _id: req.body._id
    }, updateData, function(err, data) {
        if (err) {
            res.status(400).send({
                msg: 'Error in updating data.',
                "err": err
            });
        } else {
            res.status(200).send({
                msg: 'Successfully updated fields.',
                "data": data
            });
        }
    })
}

exports.addBarberServices = function(req, res) {
    req.checkHeaders("user_id", "user_id is required").notEmpty();
    req.assert("name", "name is required").notEmpty();
    req.assert("price", "price is required").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    var saveData = req.body;
    saveData.barber_id = req.headers.user_id;
    var barber_id = objectID.isValid(req.headers.user_id)
    if (barber_id) {
        barber_service(saveData).save(function(err, data) {
            if (err) {
                res.status(400).send({
                    msg: constantObj.messages.errorInSave,
                    "err": err
                });
            } else {
                res.status(200).send({
                    msg: constantObj.messages.saveSuccessfully,
                    "data": data
                });
            }
        })
    } else {
        res.status(400).send({
            msg: 'Your input is wrong.'
        });
    }
}

exports.viewBarberProfile = function(req, res) {
    req.checkParams("barber_id", "barber ID is required").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    console.log("req.params.barber_id",req.params.barber_id);
    var id = mongoose.Types.ObjectId(req.params.barber_id);
    user.aggregate([
    {
            $match: {
                _id: id
            }
        }, {
            $lookup: {
                from: "barbers",
                localField: "_id",
                foreignField: "user_id",
                as: "barber"
            }
        }
    ]).exec(function(err, data) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                err: err
            });
        } else {
            res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                "data": data
            });
        }
    })
}

exports.viewAllServiesOfBarber = function(req, res) {
    req.checkParams("barber_id", "barber_id is required").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    barber_service.find({
        "barber_id": req.params.barber_id
    }, function(err, data) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                err: err
            });
        } else {
            res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                "data": data
            });
        }
    })
}