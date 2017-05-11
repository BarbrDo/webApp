let barber = require('../models/barber');
let constantObj = require('./../constants.js');
let barber_service = require('../models/barber_service.js');
let appointment = require('../models/appointment');
let objectID = require('mongodb').ObjectID;
let user = require('../models/User');
var mongoose = require('mongoose');
var moment = require('moment');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');

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
    console.log("req.params.barber_id", req.params.barber_id);
    var id = mongoose.Types.ObjectId(req.params.barber_id);
    user.aggregate([{
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
    }]).exec(function(err, data) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                err: err
            });
        } else {
            res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                "data": data[0]
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
exports.pendingRequestOfbarber = function(req, res) {
    req.assert('user_id', 'user_id is required');
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    var currentDate = moment().format("YYYY-MM-DD");
    appointment.find({
        "barber_id": {
            $exists: true,
            $eq: req.body.user_id
        },
        "appointment_date": {
            $gte: currentDate
        }
    }).sort({
        'created_date': -1
    }).populate('barber_id', 'first_name last_name ratings picture').populate('shop_id', 'name address city state gallery').exec(function(err, result) {
        if (err) {
            return res.status(400).send({
                msg: constantObj.messages.errorRetreivingData
            });
        } else {
            let pendingAppointments = [];
            let bookedAppointments = [];
            for (var i = 0; i < result.length; i++) {
                if (result[i].appointment_status == 'pending') {
                    pendingAppointments.push(result[i])
                }
                if (result[i].appointment_status == 'confirm') {
                    bookedAppointments.push(result[i])
                }
            }

            return res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                data: {
                    pending: pendingAppointments,
                    booked: bookedAppointments
                }
            });
        }
    })
}

exports.inviteCustomer = function(req, res) {
    req.assert('email', "Email id is required.");
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let auth = {
        auth: {
            api_key: process.env.MAILGUN_APIKEY,
            domain: process.env.MAILGUN_DOMAIN
        }
    }
    let nodemailerMailgun = nodemailer.createTransport(mg(auth));
    let mailOptions = {
        to: user.email,
        from: 'support@barbrdo.com',
        subject: '✔ Reset your password on BarbrDo',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    nodemailerMailgun.sendMail(mailOptions, function(err, info) {
        res.send({
            msg: 'An email has been sent to ' + user.email + ' with further instructions.'
        });
        done(err);
    });
}