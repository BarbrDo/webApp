let constantObj = require('./../constants.js');
let appointment = require('../models/appointment');
let user = require('../models/User');
let shop = require('../models/shop');
let moment = require('moment');
let mongoose = require('mongoose');

exports.takeAppointment = function (req, res) {
    console.log(req.body);
    req.assert("shop_id", "shop_id cannot be blank").notEmpty();
    req.assert("barber_id", "barber_id cannot be blank").notEmpty();
    req.checkHeaders("user_id", "user_id cannot be blank").notEmpty();
    req.assert("services", "servies cannot be blank").notEmpty();
    req.assert("appointment_date", "appointment_date cannot be blank").notEmpty();
    req.assert("payment_method", "payment_method cannot be blank").notEmpty();
    if (req.body.payment_method == 'card') {
        req.assert("card_lastfourdigit", "card_lastfourdigit cannot be blank").notEmpty();
    }
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    console.log("req.body.appointment_date", req.body.appointment_date);
    let appointmentdate = removeOffset(req.body.appointment_date);
    console.log("appointmentdate", appointmentdate);
    console.log(new Date(appointmentdate));
    let shopName = "";
    let customerName = "";
    let barberName = ""
    findShopData(req.body.shop_id, function (result) {
        shopName = result;
        findUserId(req.headers.user_id, function (result) {
            customerName = result
            console.log("customerName", customerName)
            findUserId(req.body.barber_id, function (result) {
                barberName = result;
                console.log("barberName,customerName,shopName", barberName, customerName, shopName);
                let saveData = req.body;
                saveData.customer_name = customerName;
                saveData.shop_name = shopName;
                saveData.barber_name = barberName;
                saveData.customer_id = req.headers.user_id;
                saveData.appointment_date = new Date(appointmentdate);
                console.log(saveData);

                appointment(saveData).save(function (err, data) {
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
                                .exec(function (err, result) {
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
let removeOffset = function (dobFormat) {
    let userOffset = new Date(dobFormat).getTimezoneOffset();
    let userOffsetMilli = userOffset * 60 * 1000;
    let dateInMilli = moment(dobFormat).unix() * 1000;
    let dateInUtc = dateInMilli - userOffsetMilli;
    return dateInUtc;
}


let findUserId = function (id, cb) {
    user.findOne({
        _id: id
    }, function (err, result) {
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
let findShopData = function (shopp, cb) {
    shop.findOne({
        _id: shopp
    }, function (err, result) {
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
exports.customerAppointments = function (req, res) {
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
            .exec(function (err, result) {
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
                            .exec(function (err, data) {

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
exports.pendingConfiramtion = function (req, res) {
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
            .exec(function (err, result) {
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



exports.countappoint = function (req, res) {
    appointment.find(function (err, barber) {
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
		if (err) {
			return res.status(400).send({
				msg: constantObj.messages.errorRetreivingData
			});
		} else {
			return res.status(200).send({
				msg: constantObj.messages.successRetreivingData,
				data: data
			});
		}
	})
}
exports.allPayments = function(req, res) {
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
	},{
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
			totalAmount:1,
			payment_status: 1,
			appointment_status: 1,

		}
	}]).exec(function(err,result) {
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