let objectID = require('mongodb').ObjectID;
let constantObj = require('./../constants.js');
let appointment = require('../models/appointment');
let user = require('../models/User');
let shop = require('../models/shop');
let moment = require('moment');
var async = require('async');
exports.takeAppointment = function(req, res) {
	req.assert("shop_id", "shop_id cannot be blank").notEmpty();
	// req.assert("shop_name", "shop_name cannot be blank").notEmpty();
	req.assert("barber_id", "barber_id cannot be blank").notEmpty();
	// req.assert("barber_name", "barber_name cannot be blank").notEmpty();
	req.checkHeaders("user_id", "user_id cannot be blank").notEmpty();
	// req.assert("customer_name", "customer_name cannot be blank").notEmpty();
	req.assert("services", "servies cannot be blank").notEmpty();
	req.assert("appointment_date", "appointment_date cannot be blank").notEmpty();
	// req.assert("tax_amount", "tax_amount cannot be blank").notEmpty();
	// req.assert("tax_percent", "tax_percent cannot be blank").notEmpty();
	// req.assert("amount", "amount cannot be blank").notEmpty();
	// req.assert("currency_code", "currency_code cannot be blank").notEmpty();
	req.assert("payment_method", "payment_method cannot be blank").notEmpty();
	if (req.body.payment_method == 'card') {
		req.assert("card_lastfourdigit", "card_lastfourdigit cannot be blank").notEmpty();
	}
	// req.assert("payment_status", "payment_status cannot be blank").notEmpty();
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
	findShopData(req.body.shop_id, function(result) {
		shopName = result;
		findUserId(req.headers.user_id, function(result) {
			customerName = result
			console.log("customerName", customerName)
			findUserId(req.body.barber_id, function(result) {
				barberName = result;
				console.log("barberName,customerName,shopName", barberName, customerName, shopName);
				let saveData = req.body;
				saveData.customer_name = customerName;
				saveData.shop_name = shopName;
				saveData.barber_name = barberName;
				saveData.customer_id = req.headers.user_id;
				saveData.appointment_date = new Date(appointmentdate);
				console.log(saveData);

				appointment(saveData).save(function(err, data) {
					if (err) {
						return res.status(400).send({
							msg: constantObj.messages.errorInSave
						});
					} else {
						appointment.findOne({
							"_id": data._id
						}).populate('barber_id', 'first_name last_name ratings picture').populate('shop_id', 'name address city state gallery').exec(function(err, result) {
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
	appointment.find({
		"customer_id": {
			$exists: true,
			$eq: req.headers.user_id
		},
		"appointment_date": {
			$gte: currentDate
		}
	}).populate('barber_id', 'first_name last_name ratings picture').populate('shop_id', 'name address city state gallery').exec(function(err, result) {
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

//Delete this function and use customerAppointments function only for both future and completed booking

/*
exports.customerCompletedAppointments = function(req, res) {
	req.assert("customer_id", "Customer id cannot be blank").notEmpty();
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	let currentDate = moment().format("YYYY-MM-DD");
	appointment.find({
		"customer_id": req.body.customer_id,
		"appointment_status": "completed",
		"appointment_date": {
			$lt: currentDate
		}
	}).populate('barber_id', 'first_name last_name ratings').populate('shop_id', 'name address city state gallery').exec(function(err, result) {
		if (err) {
			return res.status(400).send({
				msg: constantObj.messages.errorRetreivingData
			});
		} else {
			console.log("result", result);
			return res.status(200).send({
				msg: constantObj.messages.successRetreivingData,
				data: result
			});
		}
	})
}*/

exports.confirmRequestByBarber = function(req, res) {
	req.assert("_id", "Appointment _id is required.")
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	appointment.update({
		_id: req.body._id
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

exports.rescheduleAppointment = function(req, res) {
	req.assert("time", "Time is required.");
	req.assert("_id", "Appointment _id is required.")
	req.assert("appointment_date", "appointment_date is required");
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	// console.log(req.body.appointment_date);
	var newDateObj = new Date(req.body.appointment_date);
	console.log(newDateObj);
	var newDateObj = newDateObj.setMinutes(newDateObj.getMinutes() + req.body.time);
	// var momentObj = moment(req.body.appointment_date).add(req.body.time,'m');
	// console.log("momentObj",momentObj);
	// console.log("newDateObj",newDateObj);
	// console.log(new Date(newDateObj));
	appointment.update({
		_id: req.body._id
	}, {
		$set: {
			"appointment_status": "reschedule",
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

exports.confirmedRequestMarkAsComplete = function(req, res) {
	req.assert("_id", "Appointment _id is required.");
	req.assert("customer_id", "customer id is required.");
	req.checkHeaders("rated_by","rated by is required.");
	req.checkHeaders("rated_id","rated id is required.");
	req.assert("score", "score is required.");
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	let updateData = {
		"$push":{
			"ratings":{
				"rated_by":req.headers.rated_by,
				"rated_id":req.headers.rated_id,
				"score":req.body.score
			}
		}
	}
	async.waterfall([
		function(done) {
			appointment.update({
				_id: req.body._id
			}, {
				$set: {
					"appointment_status": "completed"
				}
			}, function(err, result) {
				if (err) {
					done("some error",err)
				} else {
					done(err, result)
				}
			})
		},
		function(status,done){
			user.update({_id:req.body.customer_id},updateData,function(err,result){
				if (err) {
					return res.status(400).send({
						msg: constantObj.messages.userStatusUpdateFailure
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