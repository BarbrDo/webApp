let barber = require('../models/barber');
let constantObj = require('./../constants.js');
let barber_service = require('../models/barber_service.js');
let objectID = require('mongodb').ObjectID;

exports.getBarber = function(req, res) {
    var maxDistanceToFind = constantObj.ParamValues.radiusSearch;
    if (req.headers.device_latitude && req.headers.device_longitude) {
        var long = parseFloat(req.headers.device_longitude);
        var lati = parseFloat(req.headers.device_latitude);
        var maxDistanceToFind = 500000;

           // User.aggregate([{
        //  $geoNear: {
        //      near: {
        //          type: "Point",
        //          coordinates: [long, lati]
        //      },
        //      distanceField: "dist.calculated",
        //      maxDistance: maxDistanceToFind,
        //      query: {
        //          user_type: "shop"
        //      },
        //      includeLocs: "dist.location",
        //      spherical: true
        //  }
        // }, {
        //  $lookup: {
        //      from: "shops",
        //      localField: "_id",
        //      foreignField: "user_id",
        //      as: "shop"
        //  }
        // }]).exec(function(err, data) {
        //  if (err) {
        //      console.log(err);
        //  } else {
        //      res.status(200).send({
        //          "msg": constantObj.messages.successRetreivingData,
        //          "data": data
        //      })
        //  }
        // })

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
    // console.log("updateData",updateData);
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
    req.assert("barber_id", "barber_id is required").notEmpty();
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
    var barber_id = objectID.isValid(req.body.barber_id)
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
    console.log("return");
    console.log("params",req.params);
    console.log("query",req.query);
    return false;
    req.assert("barber_id", "barber_id is required").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    barber.find({
        _id: req.body.barber_id
    }).populate('user_id').exec(function(err, data) {
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
    req.assert("barber_id", "barber_id is required").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    barber_service.find({
        "barber_id": req.body.barber_id
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