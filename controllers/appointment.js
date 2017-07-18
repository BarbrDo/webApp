let constantObj = require('./../constants.js');
let appointment = require('../models/appointment');
let user = require('../models/User');
let shop = require('../models/shop');
let barber = require('../models/barber');
let moment = require('moment');
let mongoose = require('mongoose');
let stripeToken = process.env.STRIPE;
let stripe = require('stripe')(stripeToken);
let commonObj = require('../common/common');

// exports.takeAppointment = function(req, res) {
//     console.log("appointment", req.body);
//     req.assert("shop_id", "shop_id cannot be blank").notEmpty();
//     req.assert("barber_id", "barber_id cannot be blank").notEmpty();
//     req.checkHeaders("user_id", "user_id cannot be blank").notEmpty();
//     req.assert("services", "servies cannot be blank").notEmpty();
//     req.assert("appointment_date", "appointment_date cannot be blank").notEmpty();
//     req.assert("payment_method", "payment_method cannot be blank").notEmpty();

//     let errors = req.validationErrors();
//     if (errors) {
//         return res.status(400).send({
//             msg: "error in your request",
//             err: errors
//         });
//     }
//     console.log("req.body.appointment_date", req.body.appointment_date);
//     let appointmentdate = removeOffset(req.body.appointment_date);
//     console.log("appointmentdate", appointmentdate);
//     console.log(new Date(appointmentdate));
//     let shopName = "";
//     let customerName = "";
//     let barberName = ""
//     findShopData(req.body.shop_id, function(result) {
//         shopName = result;
//         findUserId(req.headers.user_id, function(result) {
//             customerName = result
//             console.log("customerName", customerName)
//             findUserId(req.body.barber_id, function(result) {
//                 barberName = result;
//                 console.log("barberName,customerName,shopName", barberName, customerName, shopName);
//                 let saveData = req.body;
//                 saveData.customer_name = customerName;
//                 saveData.shop_name = shopName;
//                 saveData.barber_name = barberName;
//                 saveData.customer_id = req.headers.user_id;
//                 saveData.appointment_date = new Date(appointmentdate);
//                 console.log(saveData);

//                 appointment(saveData).save(function(err, data) {
//                     if (err) {
//                         return res.status(400).send({
//                             msg: constantObj.messages.errorInSave
//                         });
//                     } else {
//                         appointment.findOne({
//                                 "_id": data._id
//                             }).populate('barber_id', 'first_name last_name ratings picture created_date')
//                             .populate('customer_id', 'first_name last_name ratings picture created_date')
//                             .populate('shop_id', 'name address city state gallery created_date')
//                             .exec(function(err, result) {
//                                 if (err) {
//                                     return res.status(400).send({
//                                         msg: constantObj.messages.errorRetreivingData
//                                     });
//                                 } else {
//                                     return res.status(200).send({
//                                         msg: constantObj.messages.successRetreivingData,
//                                         data: result
//                                     });
//                                 }
//                             })
//                     }
//                 })
//             });
//         });
//     });
// }

exports.takeAppointment = function(req, res) {
    console.log("appointment Body", req.body);
    req.checkHeaders("user_id", "User Id cannot be blank").notEmpty();
    req.assert("shop_id", "Shop Id cannot be blank").notEmpty();
    req.assert("barber_id", "Barber Id cannot be blank").notEmpty();
    req.assert("services", "servies cannot be blank").notEmpty();
    req.assert("chair_id", "Chair Id cannot be blank").notEmpty();
    req.assert("appointment_date", "appointment_date cannot be blank").notEmpty();
    req.assert("payment_method", "payment_method cannot be blank").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let shop_id = req.body.shop_id;
    let user_id = req.header.user_id;
    let barber_id = req.body.barber_id;
    let chair_id = req.body.chair_id;
    let appointmentdate = new Date(removeOffset(req.body.appointment_date));
    let customerName = "";
    let barberName = ""
    getChairData(chair_id, function(err,chair) {
        if(err && !(chair.chairs.length>0)){
            return res.status(400).send({
                       msg: constantObj.messages.successRetreivingData,
                       data: result
                    });
        }
        else{
            console.log("code is started to work");
            console.log(chair.chairs[0].type);
            let shopShare = 0,barberShare = 0;
            if(chair.chairs[0].type=='percentage'){
                shopShare = (req.body.totalPrice*chair.chairs[0].shop_percentage)/100;
                barberShare = (req.body.totalPrice*chair.chairs[0].barber_percentage)/100;
            }
            else{
                barberShare = req.body.totalPrice
            }
        }
        findUserId(user_id, function(result) {
            customerName = result
            console.log("customerName", customerName)
            findUserId(barber_id, function(result) {
                barberName = result;
                console.log("barberName,customerName,shopName", barberName, customerName);
                let saveData = req.body;
                saveData.barber_share = barberShare;
                saveData.shop_share = shopShare;
                saveData.customer_name = customerName;
                saveData.shop_name = chair.name;
                saveData.barber_name = barberName;
                saveData.customer_id = user_id;
                saveData.appointment_date = appointmentdate;
                console.log(saveData);
                appointment(saveData).save(function(err, data) {
                    if (err) {
                        return res.status(400).send({
                            msg: constantObj.messages.errorInSave
                        });
                    } else {
                        appointment.findOne({
                                "_id": data._id
                            }).populate('barber_id', 'first_name last_name ratings picture created_date')
                            .populate('customer_id', 'first_name last_name ratings picture created_date')
                            .populate('shop_id', 'name address city state gallery created_date')
                            .exec(function(err, result) {
                                if (err) {
                                    return res.status(400).send({
                                        msg: constantObj.messages.errorRetreivingData
                                    });
                                } else {
                                    return res.status(200).send({
                                        msg: constantObj.messages.successRetreivingData,
                                        data: result
                                    });
                                }
                            })
                    }
                })
            });
        });
    });
}

let getChairData = function(chair_id,cb){
    shop.findOne(
        {
            chairs:
            { 
                $elemMatch : {"_id": chair_id}
            }
        },
        { 'chairs.$': 1, "name":1 }
    ).exec(function(err, chairResult) {
        console.log(chairResult);
        if (err) {
            cb(err,null);
        }
        cb(null,chairResult)
    })
}
let removeOffset = function(dobFormat) {
    let userOffset = new Date(dobFormat).getTimezoneOffset();
    let userOffsetMilli = userOffset * 60 * 1000;
    let dateInMilli = moment(dobFormat).unix() * 1000;
    let dateInUtc = dateInMilli - userOffsetMilli;
    return dateInUtc;
}


let findUserId = function(id, cb) {
    user.findOne({
        _id: id
    }, function(err, result) {
        if (err) {
            console.log("err in FindUserId", err);
        } else {
            if (result) {
                // console.log("customer "result.first_name);
                cb(result.first_name + " " + result.last_name);
            } else {
                let allResult = ""
                cb(allResult)
                    // return allResult;
            }
        }
    })
}
let findShopData = function(shopp, cb) {
    shop.findOne({
        _id: shopp
    }, function(err, result) {
        if (err) {
            console.log("err in FindUserId", err);
        } else {
            if (result.name) {
                // console.log(result.name);
                cb(result.name);
            } else {
                let allResult = ""
                cb(allResult);
            }
        }
    })
}
exports.customerAppointments = function(req, res) {
    req.checkHeaders("user_id", "user_id cannot be blank").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let currentDate = moment().format("YYYY-MM-DD");
    // below query will give us all those appointments who are pending and rescheduled
    appointment.find({
            "customer_id": {
                $exists: true,
                $eq: req.headers.user_id
            },
            "appointment_status": {
                $in: ['pending', 'reschedule', 'confirm']
            },
            "appointment_date": {
                $gte: currentDate
            }
        }).populate('barber_id', 'first_name last_name ratings picture created_date')
        .populate('customer_id', 'first_name last_name ratings picture created_date email mobile_number latLong isActive is_verified isDeleted ratings')
        .populate('shop_id', 'name address city state gallery latLong created_date user_id')
        .exec(function(err, result) {
            if (err) {
                return res.status(400).send({
                    msg: constantObj.messages.errorRetreivingData
                });
            } else {
                // This will give all appointments who are completed
                appointment.find({
                        "customer_id": {
                            $exists: true,
                            $eq: req.headers.user_id
                        },
                        "appointment_status": {
                            $in: ['completed']
                        }
                    }).populate('barber_id', 'first_name last_name ratings picture created_date')
                    .populate('customer_id', 'first_name last_name ratings picture created_date email mobile_number latLong isActive is_verified isDeleted ratings')
                    .populate('shop_id', 'name address city state gallery latLong created_date user_id')
                    .exec(function(err, data) {

                        if (err) {
                            return res.status(400).send({
                                msg: constantObj.messages.errorRetreivingData
                            });
                        } else {
                            return res.status(200).send({
                                msg: constantObj.messages.successRetreivingData,
                                data: {
                                    upcoming: result,
                                    complete: data
                                }
                            });
                        }
                    })
            }
        })
}
exports.pendingConfiramtion = function(req, res) {
    console.log("pending confirmation working");
    req.checkParams("_id", "_id cannot be blank").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    appointment.findOne({
            "_id": req.params._id
        }).populate('barber_id', 'first_name last_name ratings picture created_date')
        .populate('customer_id', 'first_name last_name ratings picture created_date')
        .populate('shop_id', 'name address latLong city state gallery created_date')
        .exec(function(err, result) {
            if (err) {
                return res.status(400).send({
                    msg: constantObj.messages.errorRetreivingData,
                    err: err
                });
            } else {
                return res.status(200).send({
                    msg: constantObj.messages.successRetreivingData,
                    data: result
                });
            }
        })
}



exports.countappoint = function(req, res) {
    appointment.find(function(err, barber) {
        res.json(barber);
    });
};
exports.showEvents = function(req, res) {
    req.assert('barber_id', 'Barber id is required.').notEmpty();
    req.assert('date', 'Date is required.').notEmpty(); //YYYY-MM-DD
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let barber_id = mongoose.Types.ObjectId(req.query.barber_id);
    let date = req.query.date;
    let appointmentStartdate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z';
    var appointmentEnddate = moment(date, "YYYY-MM-DD").add(1, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z';
    console.log(appointmentStartdate, appointmentEnddate, barber_id);
    appointment.aggregate([{
        $match: {
            barber_id: barber_id,
            appointment_date: {
                $gte: new Date(appointmentStartdate),
                $lt: new Date(appointmentEnddate)
            },
            appointment_status: 'confirm'
        }
    }]).exec(function(err, data) {
        barber.aggregate([{
                $match: {
                    "user_id": barber_id,
                }
            }, {
                $unwind: "$events"
            }, {
                $match: {
                    "events.startsAt": {
                        $gte: new Date(appointmentStartdate),
                        $lt: new Date(appointmentEnddate)
                    }
                }
            }

        ]).exec(function(err, eventsData) {
            console.log(eventsData);
            if (err) {
                return res.status(400).send({
                    msg: constantObj.messages.errorRetreivingData
                });
            }
            var events = [];
            if (eventsData.length > 0) {
                return res.status(200).send({
                    msg: constantObj.messages.successRetreivingData,
                    data: {
                        events: [eventsData[0].events],
                        appointment: data

                    }
                });
            } else {
                return res.status(200).send({
                    msg: constantObj.messages.successRetreivingData,
                    data: {
                        events: events,
                        appointment: data
                    }
                });
            }
        })
    })
}
exports.allPayments = function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var count = parseInt(req.query.count) || 30;
    var skipNo = (page - 1) * count;
    console.log(page)
    console.log(count)
    console.log(skipNo)
    var query = {};
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

    appointment.aggregate([{
        $unwind: "$services"
    }, {
        $group: {
            _id: "$_id",
            "appointment_date": {
                "$first": "$appointment_date"
            },
            "barber_id": {
                "$first": "$barber_id"
            },
            "payment_method": {
                "$first": "$payment_method"
            },
            "shop_id": {
                "$first": "$shop_id"
            },
            "customer_id": {
                "$first": "$customer_id"
            },
            "payment_status": {
                "$first": "$payment_status"
            },
            "appointment_status": {
                "$first": "$appointment_status"
            },
            "totalAmount": {
                "$sum": "$services.price"
            }
        }
    }, {
        $lookup: {
            from: 'shops',
            localField: 'shop_id',
            foreignField: '_id',
            as: 'shopInfo'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'barber_id',
            foreignField: '_id',
            as: 'barberInfo'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'customer_id',
            foreignField: '_id',
            as: 'customerInfo'
        }
    }, {
        $project: {
            _id: 1,
            appointment_date: 1,
            payment_method: 1,
            barberInfo: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                picture: 1
            },
            shopInfo: {
                _id: 1,
                name: 1,
            },
            customerInfo: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                picture: 1
            },
            totalAmount: 1,
            payment_status: 1,
            appointment_status: 1,

        }
    }, {
        $match: query
    }, {
        "$skip": skipNo
    }, {
        "$limit": count
    }]).exec(function(err, result) {
        var length = result.length;
        if (err) {
            return res.status(400).send({
                msg: constantObj.messages.errorRetreivingData
            });
        } else {
            return res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                data: result,
                count: length
            });
        }
    })
}
exports.payafterappointment = function(req, res) {
    console.log(req.body);
    req.assert('appointmentId', 'appointmentId is required.').notEmpty();
    req.assert('date', 'Date is required.').notEmpty(); //YYYY-MM-DD
    req.checkHeaders('user_id','user_id is required').notEmpty();
    req.assert('token','token is required.').notEmpty();
    req.assert('amount','amount is required.').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let chargeAmount = req.body.amount * 100;
    console.log(chargeAmount);
    user.findOne({
        _id: req.headers.user_id
    }, function(err, data) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                "err": err
            });
        } else {
            console.log(data);
            let email = data.email
            appointment.findOne({
                "_id": req.body.appointmentId
            }, function(err, result) {
                if (err) {
                    return res.status(400).send({
                        msg: constantObj.messages.errorRetreivingData
                    });
                } else {
                    if (result) {
                        stripe.customers.create({
                            email: email,
                            source: req.body.token,
                        }).then(function(customer) {
                            // YOUR CODE: Save the customer ID and other info in a database for later.
                            return stripe.charges.create({
                                amount: chargeAmount,
                                currency: "usd",
                                capture: false,
                                customer: customer.id,
                            });
                        }).then(function(charge) {
                            let updateDate = {
                                payment_status: "confirm",
                                payment_method: "card",
                                payment_detail: charge
                            }
                            appointment.update({"_id": req.body.appointmentId},updateDate, function(err, data) {
                                if (err) {
                                    return res.status(400).send({
                                        msg: constantObj.messages.errorRetreivingData
                                    });
                                } else {
                                    console.log("updateData", data);
                                    return res.status(200).send({
                                        msg: "Payment Successfully done.",
                                        data: data
                                    });
                                }
                            })
                        });
                    }
                }
            })
        }
    })
}
exports.sentMessage = function  (req,res) {
    commonObj.sentMessage(function  () {
        console.log("working");
    })
}
exports.pushNotificationForIOS = function (req,res) {
    commonObj.pushSendToIOS('108FBEDD34AC9826751562522C201163B2369AAB62553094FBC47BEADB0B0F6F',function  () {
        console.log("working");
    })
}