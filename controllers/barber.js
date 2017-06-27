let barber = require('../models/barber');
let constantObj = require('./../constants.js');
let service = require('../models/service');
let barber_service = require('../models/barber_service');
let appointment = require('../models/appointment');
let objectID = require('mongodb').ObjectID;
let user = require('../models/User');
let mongoose = require('mongoose');
let moment = require('moment');
let async = require('async');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');

/*
exports.getBarber = function (req, res) {
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
*/
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

exports.getAllServices = function(req, res) {
    service.find({
        "status": true
    }, function(err, data) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                err: err
            })
        } else {
            res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                "data": data
            })
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

exports.editBarberServices = function(req, res) {
    req.checkHeaders("user_id", "User Id is required").notEmpty();
    req.checkParams("barber_service_id", "Barber Service Id is required").notEmpty();
    req.assert("price", "Service Price is required").notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({
            msg: "error in request",
            err: req.validationErrors()
        })
    }

    barber_service.update({
        _id: req.params.barber_service_id
    }, {
        $set: {
            "price": req.body.price
        }
    }, function(err, result) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.userStatusUpdateFailure
            })
        } else {
            res.status(200).send({
                msg: constantObj.messages.userStatusUpdateSuccess
            })
        }
    })
}

exports.deleteBarberService = function(req, res) {
    req.checkHeaders("user_id", "User Id is required").notEmpty();
    req.checkParams("barber_service_id", "Barber Service Id is required").notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({
            msg: "error in request",
            err: req.validationErrors()
        })
    }

    barber_service.update({
        _id: req.params.barber_service_id
    }, {
        $set: {
            "isDeleted": true
        }
    }, function(err, result) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.userStatusUpdateFailure
            })
        } else {
            res.status(200).send({
                msg: constantObj.messages.userDeleteSuccess
            })
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
        "barber_id": req.params.barber_id,
        "isDeleted": false
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

//Get pending/confirmed appointments of barber
exports.appointments = function(req, res) {
    req.checkHeaders('user_id', 'user_id is required').notEmpty();
    console.log(req.headers.user_id);
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
                $eq: req.headers.user_id
            },
            "appointment_date": {
                $gte: currentDate
            }

        }).sort({
            'created_date': -1
        }).populate('barber_id', 'first_name last_name ratings picture')
        .populate('customer_id', 'first_name last_name ratings picture')
        .populate('shop_id', 'name address city state gallery latLong')
        .exec(function(err, result) {
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
    req.assert('email', "Email id is required.").notEmpty();
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

//Mark Appointment as confirmed
exports.confirmAppointment = function(req, res) {
    req.checkParams("appointment_id", "Appointment _id is required.").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    appointment.update({
        _id: req.params.appointment_id
    }, {
        $set: {
            "appointment_status": "confirm"
        }
    }, function(err, result) {
        if (err) {
            return res.status(400).send({
                msg: constantObj.messages.userStatusUpdateFailure
            });
        } else {
            return res.status(200).send({
                msg: constantObj.messages.userStatusUpdateSuccess
            });
        }
    })
}

//Reschedule Appointment
exports.rescheduleAppointment = function(req, res) {
    req.assert("minutes", "Time is required.").notEmpty();
    req.checkParams("appointment_id", "Appointment _id is required.").notEmpty();
    req.assert("appointment_date", "appointment_date is required").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    var newDateObj = new Date(req.body.appointment_date);
    console.log("newDateObj",newDateObj);
    console.log("body",req.body)
    var newDateObj = newDateObj.setMinutes(newDateObj.getMinutes() + req.body.minutes);
    appointment.update({
        _id: req.params.appointment_id
    }, {
        $set: {
            "appointment_date": newDateObj
        }
    }, function(err, result) {
        if (err) {
            return res.status(400).send({
                msg: constantObj.messages.userStatusUpdateFailure
            });
        } else {
            return res.status(200).send({
                msg: constantObj.messages.userStatusUpdateSuccess
            });
        }
    })
}

//Mark Appointment as complete
exports.completeAppointment = function(req, res) {
    req.checkParams("appointment_id", "Appointment _id is required.").notEmpty();
    req.assert("customer_id", "customer id is required.").notEmpty();
    req.checkHeaders("user_id", "barber_id is required.").notEmpty();
    req.assert("score", "score is required.").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    console.log("req.body",req.body);
    console.log("req.headers",req.headers);
    let updateData = {
        "$push": {
            "ratings": {
                "rated_by": req.headers.user_id,
                "rated_by_name": req.body.rated_by_name,
                "score": parseInt(req.body.score),
                "comments": req.body.comments,
                "appointment_date": req.body.appointment_date
            }
        }
    }
    console.log(updateData);
    async.waterfall([
        function(done) {
            appointment.update({
                _id: req.params.appointment_id
            }, {

                    $set: {
                        "appointment_status": "completed"
                    }
                }, function (err, result) {
                    if (err) {
                        done("some error", err)
                    } else {
                        done(err, result)
                        console.log(result)
                    }
                })


        },
        function(status, done) {
            user.update({
                _id: req.body.customer_id
            }, updateData, function(err, result) {
                if (err) {
                    return res.status(400).send({
                        msg: constantObj.messages.userStatusUpdateFailure,
                        err: err
                    });
                } else {
                    console.log(result)
                    return res.status(200).send({
                        msg: constantObj.messages.userStatusUpdateSuccess
                    });
                    done(err);
                }
            })
        }
    ])
}

//Mark Appointment as cancel
exports.cancelAppointment = function(req, res) {
    req.checkParams("appointment_id", "Appointment id is required.").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    appointment.update({
        _id: req.params.appointment_id
    }, {
        $set: {
            "appointment_status": "cancel"
        }
    }, function(err, result) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                "err": err
            });
        } else {
            res.status(200).send({
                msg: 'Successfully updated fields.',
                "data": result
            });
        }
    })
}

exports.uploadBarberGallery = function(req, res) {
    req.checkHeaders("user_id", "_id is required").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let updateData = {};
    updateData.modified_date = new Date()
    delete updateData._id;
    if ((req.files) && (req.files.length > 0)) {
        let userimg = [];
        for (let i = 0; i < req.files.length; i++) {
            let obj = {};
            obj.name = req.files[i].filename;
            userimg.push(obj);

        }
        updateData.gallery = userimg;
    }
    console.log("updateData.gallery", updateData.gallery);
    user.update({
        _id: req.headers.user_id
    }, {
        $push: {
            gallery: {
                $each: updateData.gallery
            }
        }
    }, function(errorInSaveChair, success) {
        if (errorInSaveChair) {
            res.status(400).send({
                msg: 'Error in finding shop.'
            });
        } else {
            user.findOne({
                _id: req.headers.user_id
            }, function(err, response) {
                if (err) {
                    res.status(400).send({
                        msg: constantObj.messages.errorRetreivingData,
                        "err": err
                    });
                } else {
                    res.status(200).send({
                        msg: 'Successfully updated fields.',
                        "user": response,
                        "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
                    });
                }
            })
        }
    })
}

exports.deleteImages = function(req, res) {
    req.checkHeaders("user_id", "").notEmpty();
    req.checkParams("image_id", "Image _id is required").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    // let filePath = "../public/uploadedFiles/" + req.body.image_name;
    // fs.unlinkSync(filePath);
    user.update({
        "_id": req.headers.user_id
    }, {
        $pull: {
            "gallery": {
                "_id": req.params.image_id
            }
        }
    }, function(error, result) {
        if (error) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                "err": err
            });
        } else {
            user.findOne({
                _id: req.headers.user_id
            }, function(err, response) {
                if (err) {
                    res.status(400).send({
                        msg: constantObj.messages.errorRetreivingData,
                        "err": err
                    });
                } else {
                    res.status(200).send({
                        msg: 'Successfully updated fields.',
                        "user": response,
                        "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
                    });
                }
            })
        }
    })
}
exports.particularAppointment = function(req, res) {
    req.checkParams("appointment_id", "Appointment id is required.").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    appointment.findOne({
            _id: req.params.appointment_id
        }).populate('barber_id', 'first_name last_name ratings picture')
        .populate('customer_id', 'first_name last_name ratings picture')
        .populate('shop_id', 'name address city state gallery latLong')
        .exec(function(err, result) {
            if (err) {
                res.status(400).send({
                    msg: constantObj.messages.errorRetreivingData,
                    "err": err
                });
            } else {
                res.status(200).send({
                    msg: 'Successfully retrieve data.',
                    "data": result
                });
            }
        })
}



exports.availableBarber = function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var count = parseInt(req.query.count) || 30;
    var skipNo = (page - 1) * count;
    var query = {};
    query.user_type = "barber"
    var searchStr = ""
    if (req.query.search) {
        searchStr = req.query.search;
    }
    if (searchStr) {
        query.$or = [{
            first_name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            last_name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            email: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }
    console.log(query);
    user.aggregate([{
        $project: {
            _id: "$_id",
            first_name: "$first_name",
            last_name: "$last_name",
            email: "$email",
            mobile_number: "$mobile_number",
            ratings: "$ratings",
            created_date: "$created_date",
            isDeleted: "$isDeleted",
            isActive: "$isActive",
            is_verified: "$is_verified",
            user_type: "$user_type",
            picture: "$picture"
        }
    }, {
        $match: query
    }]).exec(function(err, data) {
        if (err) {
            console.log(err)
        } else {
            var length = data.length;
            user.aggregate([{
                $lookup: {
                    from: "shops",
                    "localField": "_id",
                    "foreignField": "chairs.barber_id",
                    "as": "shopdetails"
                }
            }, {
                $project: {
                    _id: "$_id",
                    first_name: "$first_name",
                    last_name: "$last_name",
                    email: "$email",
                    mobile_number: "$mobile_number",
                    created_date: "$created_date",
                    ratings: "$ratings",
                    isDeleted: "$isDeleted",
                    isActive: "$isActive",
                    is_verified: "$is_verified",
                    user_type: "$user_type",
                    latLong: "$latLong",
                    picture: "$picture",
                    name: "$shopdetails.name",
                    shop: "$shopdetails"
                }
            }, {
                $match: query
            }, {
                "$skip": skipNo
            }, {
                "$limit": count
            }]).exec(function(err, result) {
                if (err) {
                    res.status(400).send({
                        "msg": constantObj.messages.userStatusUpdateFailure,
                        "err": err
                    });
                } else {
                    res.status(200).send({
                        "msg": constantObj.messages.successRetreivingData,
                        "data": result,
                        "count": length
                    })
                }
            })
        }
    })


};

exports.countbarber = function(req, res) {

    user.find({
        user_type: "barber"
    }, function(err, barber) {
        res.json(barber);
    });
};

exports.deactivebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    user.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isActive: false
        }
    }, function(err, count) {
        user.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};


exports.activatebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    user.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isActive: true
        }
    }, function(err, count) {
        user.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.verifybarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    user.update({
        _id: req.params.barber_id
    }, {
        $set: {
            is_verified: true
        }
    }, function(err, count) {
        user.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.disapprovebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    user.update({
        _id: req.params.barber_id
    }, {
        $set: {
            is_verified: false
        }
    }, function(err, count) {
        user.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};


exports.deletebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    user.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isDeleted: true
        }
    }, function(err, count) {
        user.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.undeletebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    user.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isDeleted: false
        }
    }, function(err, count) {
        user.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.barberdetail = function(req, res) {
    req.checkParams("barber_id", "barber_id cannot be blank").notEmpty();
    var query = {};
    query._id = mongoose.Types.ObjectId(req.params.barber_id);
    query.user_type = "barber";
    user.aggregate([{
        $lookup: {
            from: "shops",
            "localField": "_id",
            "foreignField": "chairs.barber_id",
            "as": "shopdetails"
        }
    }, {
        $project: {
            _id: "$_id",
            first_name: "$first_name",
            last_name: "$last_name",
            email: "$email",
            mobile_number: "$mobile_number",
            created_date: "$created_date",
            ratings: "$ratings",
            isDeleted: "$isDeleted",
            isActive: "$isActive",
            is_verified: "$is_verified",
            user_type: "$user_type",
            latLong: "$latLong",
            picture: "$picture",
            name: "$shopdetails.name",
            shop: "$shopdetails"
        }
    }, {
        $match: query
    }]).exec(function(err, result) {
        if (err) {
            res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure,
                "err": err
            });
        } else {
            res.status(200).send({
                "msg": constantObj.messages.successRetreivingData,
                "data": result
            })
        }
    })
};    

exports.rateBarber = function(req, res) {
    req.checkHeaders("user_id", "User id is required.").notEmpty();
    req.assert("appointment_id", "Appointment _id is required.").notEmpty();
    req.assert("appointment_date", "Appointment date is required").notEmpty();
    req.assert("barber_id", "Barber id is required.").notEmpty();
    req.assert("score", "score is required.").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    console.log(req.body);
    console.log(req.headers);
    let updateData = {
        "$push": {
            "ratings": {
                "rated_by": req.headers.user_id,
                "rated_by_name": req.body.rated_by_name,
                "score": parseInt(req.body.score),
                "comments": req.body.comments,
                "appointment_date": req.body.appointment_date
            }
        }
    }
    console.log(updateData);
    async.waterfall([
        function(done) {
            appointment.update({
                _id: req.body.appointment_id
            }, {
                $set: {
                    is_rating_given: true
                }
            }, function(err, result) {
                if (err) {
                    done("some error", err)
                } else {
                    if(result.nModified == 0){
                        return res.status(400).send({
                        msg: "no record found",
                        err: err
                        });
                    }else {
                        done(err, result);
                    }
                }
            })
        },
        function(status, done) {
            user.update({
                _id: req.body.barber_id
            }, updateData, function(err, result) {
                if (err) {
                    return res.status(400).send({
                        msg: constantObj.messages.userStatusUpdateFailure,
                        err: err
                    });
                } else {
                    return res.status(200).send({
                        msg: constantObj.messages.userStatusUpdateSuccess
                    });
                    done(err);
                }
            })
        }
    ])
}
exports.viewBarberAvailability = function(req, res) {
    console.log(req.params);
    console.log(req.query);
    let timeArray = ["9:00", "9:15", "9:30", "9:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "1:00", "1:15", "1:30", "1:45", "2:00", "2:15", "2:30", "2:45", "3:00", "3:15", "3:30", "3:45", "4:00", "4:15", "4:30", "4:45", "5:00", "5:15", "5:30", "5:45", "6:00", "6:15", "6:30", "6:45", "7:00", "7:15", "7:30", "7:45", "8:00", "8:15", "8:30", "8:45"];
    req.checkParams("barber_id", "Barber id is required.").notEmpty();
    req.checkQuery("date", "Date is required.").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let currentDate = req.query.date;
    let endDate = moment(currentDate, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD[T]HH:mm:ss.SSS");
    appointment.find({
        barber_id: req.params.barber_id,
        appointment_status: 'confirm',
        appointment_date: {
            $gte: new Date(currentDate).toISOString(),
            $lte: endDate + 'Z'
        }
    }).exec(function(err, result) {
        if (err) {
            return res.status(400).send({
                msg: "error while fetching data.",
                err: err
            });
        } else {
            console.log(result);
            if (result.length > 0) {
                let morning = [];
                let afternoon = [];
                let evening = [];
                let resultTantTime = [];
                for (var i = 0; i < result.length; i++) {
                    var time = moment.utc(result[i].appointment_date).format("HH:mm");
                    let x = "";
                    switch (time) {
                        case "9:00":
                            x = time;
                            break;
                        case "9:15":
                            x = time;
                            break;
                        case "9:30":
                            x = time;
                            break;
                        case "9:45":
                            x = time;
                            break;
                        case "10:00":
                            x = time;
                            break;
                        case "10:15":
                            x = time;
                            break;
                        case "10:30":
                            x = time;
                            break;
                        case "10:45":
                            x = time;
                            break;
                        case "11:00":
                            x = time;
                            break;
                        case "11:15":
                            x = time;
                            break;
                        case "11:30":
                            x = time;
                            break;
                        case "11:45":
                            x = time;
                            break;
                        case "12:00":
                            x = time;
                            break;
                        case "12:15":
                            x = time;
                            break;
                        case "12:30":
                            x = time;
                            break;
                        case "12:45":
                            x = time;
                            break;
                        case "13:00":
                            x = "1:00";
                            break;
                        case "13:15":
                            x = "1:15";
                            break;
                        case "13:30":
                            x = "1:30";
                            break;
                        case "13:45":
                            x = "1:45";
                            break;
                        case "14:00":
                            x = "2:00";
                            break;
                        case "14:15":
                            x = "2:15";
                            break;
                        case "14:30":
                            x = "2:30";
                            break;
                        case "14:45":
                            x = "2:45";
                            break;
                        case "15:00":
                            x = "3:00";
                            break;
                        case "15:15":
                            x = "3:15";
                            break;
                        case "15:30":
                            x = "3:30";
                            break;
                        case "15:45":
                            x = "3:45";
                            break;
                        case "16:00":
                            x = "4:00";
                            break;
                        case "16:15":
                            x = "4:15";
                            break;
                        case "16:30":
                            x = "4:30";
                            break;
                        case "16:45":
                            x = "4:45";
                            break;
                        case "17:00":
                            x = "5:00";
                            break;
                        case "17:15":
                            x = "5:15";
                            break;
                        case "17:30":
                            x = "5:30";
                            break;
                        case "17:45":
                            x = "5:45";
                            break;
                        case "18:00":
                            x = "6:00";
                            break;
                        case "18:15":
                            x = "6:15";
                            break;
                        case "18:30":
                            x = "6:30";
                            break;
                        case "18:45":
                            x = "6:45";
                            break;
                        case "19:00":
                            x = "7:00";
                            break;
                        case "19:15":
                            x = "7:15";
                            break;
                        case "19:30":
                            x = "7:30";
                            break;
                        case "19:45":
                            x = "7:45";
                            break;
                        case "20:00":
                            x = "8:00";
                            break;
                        case "20:15":
                            x = "8:15";
                            break;
                        case "20:30":
                            x = "8:30";
                            break;
                        case "20:45":
                            x = "8:45";
                            break;
                    }
                    resultTantTime.push(x);
                }
                console.log("resultTantTime",resultTantTime);
                let newArray = [];
                for (var i = 0; i < timeArray.length; i++) {
                    let k = 0;
                    for (var j = 0; j < resultTantTime.length; j++) {
                        if (timeArray[i]==resultTantTime[j]){
                            let obj = {
                                time:timeArray[i],
                                isAvailable:false
                            }
                            newArray.push(obj)
                            k=1;
                        }
                    }
                    if(k==0){
                        let obj = {
                                time:timeArray[i],
                                isAvailable:true
                            }
                        newArray.push(obj)
                    }
                }
                for (var k = 0; k < newArray.length; k++) {
                    var reslt = newArray[k].time.split(":");
                    reslt = parseInt(reslt[0]);
                    if (reslt >= 9 && reslt <= 11) {
                            morning.push(newArray[k]);
                    }
                    if (reslt >= 12 || reslt <= 4) {
                            afternoon.push(newArray[k]);
                    }
                    if (reslt >= 5 && reslt <= 8) {
                            evening.push(newArray[k]);
                    }
                }
                let timeSlots = {
                    morning:morning,
                    afternoon:afternoon,
                    evening:evening
                }
                return res.status(200).send({
                    msg: "Time slots retrieve.",
                    data: timeSlots
                });
            } else {
                return res.status(200).send({
                    msg: "Time slots are successfully retrieve.",
                    data: constantObj.timeSlots
                });
            }
        }
    })
}
