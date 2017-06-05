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
exports.editBarber = function (req, res) {
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
    }, updateData, function (err, data) {
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

exports.getAllServices = function (req, res){
    service.find({"status":true },function(err,data){
        if(err){
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

exports.addBarberServices = function (req, res) {
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
        barber_service(saveData).save(function (err, data) {
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

exports.editBarberServices = function(req, res){
    req.checkHeaders("user_id", "User Id is required").notEmpty();
    req.checkParams("barber_service_id", "Barber Service Id is required"). notEmpty();
    req.assert("price", "Service Price is required"). notEmpty();
    
    if(req.validationErrors()){
        return res.status(400).send({
            msg:"error in request",
            err: req.validationErrors()
        })
    }
    
    barber_service.update(
            {
                _id: req.params.barber_service_id
            },{
                $set: {
                    "price": req.body.price
                }
            },function (err, result){
                if(err){
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

exports.deleteBarberService = function(req, res){
    req.checkHeaders("user_id", "User Id is required").notEmpty();
    req.checkParams("barber_service_id", "Barber Service Id is required"). notEmpty();
    
    if(req.validationErrors()){
        return res.status(400).send({
            msg:"error in request",
            err: req.validationErrors()
        })
    }
    
    barber_service.update(
            {
                _id: req.params.barber_service_id
            },{
                $set: {
                    "isDeleted": true
                }
            },function (err, result){
                if(err){
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

exports.viewAllServiesOfBarber = function (req, res) {
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
    }, function (err, data) {
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

exports.viewBarberProfile = function (req, res) {
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
    }]).exec(function (err, data) {
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
exports.appointments = function (req, res) {
    req.checkHeaders('user_id', 'user_id is required').notEmpty();
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
    .exec(function (err, result) {
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

exports.inviteCustomer = function (req, res) {
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
    nodemailerMailgun.sendMail(mailOptions, function (err, info) {
        res.send({
            msg: 'An email has been sent to ' + user.email + ' with further instructions.'
        });
        done(err);
    });
}

//Mark Appointment as confirmed
exports.confirmAppointment = function (req, res) {
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
        }, function (err, result) {
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
exports.rescheduleAppointment = function (req, res) {
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
    console.log(newDateObj);
    var newDateObj = newDateObj.setMinutes(newDateObj.getMinutes() + req.body.minutes);
    appointment.update({
        _id: req.params.appointment_id
    }, {
            $set: {
                "appointment_status": "reschedule",
                "appointment_date": newDateObj
            }
        }, function (err, result) {
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
exports.completeAppointment = function (req, res) {
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
    console.log(req.body);
    console.log(req.headers);
    let updateData = {
        "$push": {
            "ratings": {
                "rated_by": req.headers.user_id,
                "rated_by_name":req.body.rated_by_name,
                "score": parseInt(req.body.score),
                "comments": req.body.comments,
                "appointment_date":req.body.appointment_date
            }
        }
    }
    console.log(updateData);
    async.waterfall([
        function (done) {
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
                    }
                })
        },
        function (status, done) {
            user.update({ _id: req.body.customer_id }, updateData, function (err, result) {
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

//Mark Appointment as cancel
exports.cancelAppointment = function (req, res) {
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
        }, function (err, result) {
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

exports.uploadBarberGallery = function (req, res) {
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
        }, function (errorInSaveChair, success) {
            if (errorInSaveChair) {
                res.status(400).send({
                    msg: 'Error in finding shop.'
                });
            } else {
                user.findOne({
                    _id: req.headers.user_id
                }, function (err, response) {
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
exports.particularAppointment = function(req,res){
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
    .exec(function (err, result){
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