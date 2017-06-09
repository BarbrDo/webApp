let chairRequest = require('../models/chair_request');
let chairBook = require('../models/chair_booking');
let objectID = require('mongodb').ObjectID;
let constantObj = require('./../constants.js');
var shop = require('../models/shop');
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
let user = require('../models/User');
// exports.requestChair = function(req, res) {
// 	req.checkHeaders("user_id", "User is is required.").notEmpty();
// 	// req.assert("shop_id", "Shop Id is required.").notEmpty();
// 	req.assert("chair_id", "Chair Id is required.").notEmpty();
// 	// req.assert("barber_id", "Barber Id is required.").notEmpty();
// 	// req.assert("barber_11name", "Barbar Name is  required.").notEmpty();
// 	// req.assert("booking_date", "Booking Date is required.").notEmpty();
// 	var errors = req.validationErrors();
// 	if (errors) {
// 		return res.status(400).send({
// 			msg: "error in your request",
// 			err: errors
// 		});
// 	}
// 	/*This code is to check that weather the booking date is under one month of current date or not*/
// 	var currentDate = moment().format("YYYY-MM-DD");
// 	currentDate = moment(currentDate)
// 	var futureMonth = moment(currentDate).add(1, 'M');
// 	var futureMonthEnd = moment(futureMonth).endOf('month');
// 	if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
// 		futureMonth = futureMonth.add(1, 'd');
// 	}
// 	var bookDate = moment(req.body.booking_date);
// 	if (bookDate < futureMonth) {
// 		var shopId = objectID.isValid(req.body.shop_id)
// 		var chairId = objectID.isValid(req.body.chair_id)
// 		var barbrId = objectID.isValid(req.body.barber_id)
// 		if (shopId && chairId && barbrId) {
// 			var saveData = req.body;
// 			user.findOne({
// 				_id: req.headers.user_id
// 			}, function(err, data) {
// 				if (data) {
// 					if (data.user_type == 'barber') {
// 						req.assert("shop_id", "Shop Id is required.").notEmpty();
// 						req.assert("booking_date", "Booking Date is required.").notEmpty();

// 						var errors = req.validationErrors();
// 						if (errors) {
// 							return res.status(400).send({
// 								msg: "error in your request",
// 								err: errors
// 							});
// 						}
// 					} else if (data.user_type == 'shop') {
// 						req.assert("barber_id", "Barber Id is required.").notEmpty();

// 						var errors = req.validationErrors();
// 						if (errors) {
// 							return res.status(400).send({
// 								msg: "error in your request",
// 								err: errors
// 							});
// 						}
// 					}
// 					saveData.requested_by = data.user_type

// 					saveData.status = "pending";
// 					chairRequest(saveData).save(function(err, result) {
// 						if (err) {
// 							return res.status(400).send({
// 								msg: constantObj.messages.errorInSave
// 							})
// 						} else {
// 							res.status(200).send({
// 								msg: "Your request for shop is successfully registered.",
// 								data: result
// 							});
// 						}
// 					})
// 				} else {
// 					res.status(200).send({
// 						msg: "User is not present.",
// 						data: result
// 					});
// 				}
// 			})
// 		} else {
// 			res.status(400).send({
// 				msg: 'Your input is wrong.'
// 			});
// 		}
// 	} else {
// 		res.status(400).send({
// 			msg: "You cannot add Booking for more than one month."
// 		})
// 	}
// 	/*End of booking date*/
// }

exports.requestChair = function(req, res) {
	req.checkHeaders("user_id", "User is is required.").notEmpty();
	req.assert("chair_id", "Chair Id is required.").notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	let saveData = {};
	user.findOne({
		_id: req.headers.user_id
	}, function(err, data) {
		if (data) {
			if (data.user_type == 'barber') {
				req.assert("shop_id", "Shop Id is required.").notEmpty();
				req.assert("booking_date", "Booking Date is required.").notEmpty();
				var errors = req.validationErrors();
				if (errors) {
					return res.status(400).send({
						msg: "error in your request",
						err: errors
					});
				}
				// to check booking date is Under one month or not
				var currentDate = moment().format("YYYY-MM-DD");
				currentDate = moment(currentDate)
				var futureMonth = moment(currentDate).add(1, 'M');
				var futureMonthEnd = moment(futureMonth).endOf('month');
				if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
					futureMonth = futureMonth.add(1, 'd');
				}
				var bookDate = moment(req.body.booking_date);
				if (bookDate < futureMonth) {
					saveData = req.body;
					saveData.requested_by = data.user_type
					saveData.barber_id = req.headers.user_id
					saveData.status = "pending";
					chairRequest(saveData).save(function(err, result) {
						if (err) {
							return res.status(400).send({
								msg: constantObj.messages.errorInSave
							})
						} else {
							res.status(200).send({
								msg: "Your request for shop is successfully registered.",
								data: result
							});
						}
					})
				} else {
					res.status(400).send({
						msg: "You cannot add Booking for more than one month."
					})
				}
			} else if (data.user_type == 'shop') {
				req.assert("barber_id", "Barber Id is required.").notEmpty();
				var errors = req.validationErrors();
				if (errors) {
					return res.status(400).send({
						msg: "error in your request",
						err: errors
					});
				}
				saveData = req.body;
				saveData.shop_id = req.headers.user_id
				saveData.requested_by = data.user_type
				saveData.status = "pending";
				chairRequest(saveData).save(function(err, result) {
					if (err) {
						return res.status(400).send({
							msg: constantObj.messages.errorInSave
						})
					} else {
						res.status(200).send({
							msg: "Your request for shop is successfully registered.",
							data: result
						});
					}
				})
			}
		}
		else{
			res.status(400).send({
				msg: "User is not present.",
				data: result
			});
		}
	})
}
exports.bookChair = function(req, res) {
	req.checkHeaders("shop_id", "_id is required.").notEmpty();
	req.assert("chair_request_id", "chair_request_id is required").notEmpty()
	req.assert("chair_id", "Chair id is required.").notEmpty();
	req.assert("barber_id", "Barber id is required.").notEmpty();
	req.assert("barber_name", "Barber name is required.").notEmpty();
	req.assert("type", "Type is required.").notEmpty();
	req.assert("booking_date", "booking_date is required.").notEmpty();
	req.assert
	req.assert("created_date", "Chair request created date is required").notEmpty();
	let updateCollectionData = {};
	let bookingEndDate = "";
	console.log(req.body);
	if (req.body.type == 'weekly') {
		// console.log("weekly working",req.body.amount);
		req.assert("amount", "Amount is required.").notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			return res.status(400).send({
				msg: "error in your request",
				err: errors
			});
		}
		bookingEndDate = moment(req.body.booking_date).add(7, 'day')
		updateCollectionData = {
			"$set": {
				"chairs.$.booking_start": req.body.booking_date,
				"chairs.$.type": req.body.type,
				"chairs.$.booking_end": bookingEndDate,
				"chairs.$.amount": req.body.amount,
				"chairs.$.barber_id": req.body.barber_id,
				"chairs.$.barber_name": req.body.barber_name,
				"chairs.$.availability": "booked"
			}
		};
	}
	if (req.body.type == 'percentage') {
		req.assert("shop_percentage", "Shop Percentage is required.")
		req.assert("barber_percentage", "Barber Percentage is required.")
		var errors = req.validationErrors();
		if (errors) {
			return res.status(400).send({
				msg: "error in your request",
				err: errors
			});
		}
		// var currentDate = moment().format("YYYY-MM-DD");
		let currentDate = moment(req.body.booking_date)
		let futureMonth = moment(req.body.booking_date).add(1, 'M');
		let futureMonthEnd = moment(futureMonth).endOf('month');
		if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
			futureMonth = futureMonth.add(1, 'd');
		}
		// console.log("futureMonth", futureMonth);
		bookingEndDate = futureMonth
		updateCollectionData = {
			"$set": {
				"chairs.$.booking_start": req.body.booking_date,
				"chairs.$.type": req.body.type,
				"chairs.$.booking_end": futureMonth,
				"chairs.$.shop_percentage": req.body.shop_percentage,
				"chairs.$.barber_percentage": req.body.barber_percentage,
				"chairs.$.barber_id": req.body.barber_id,
				"chairs.$.barber_name": req.body.barber_name,
				"chairs.$.availability": "booked"
			}
		}
	}
	if (req.body.type == 'monthly') {
		req.assert("amount", "Amount is required.").notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			return res.status(400).send({
				msg: "error in your request",
				err: errors
			});
		}
		let currentDate = moment(req.body.booking_date)
		let futureMonth = moment(req.body.booking_date).add(1, 'M');
		let futureMonthEnd = moment(futureMonth).endOf('month');
		if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
			futureMonth = futureMonth.add(1, 'd');
		}
		// console.log("futureMonth", futureMonth);
		bookingEndDate = futureMonth
		updateCollectionData = {
			"$set": {
				"chairs.$.booking_start": req.body.booking_date,
				"chairs.$.type": req.body.type,
				"chairs.$.booking_end": futureMonth,
				"chairs.$.amount": req.body.amount,
				"chairs.$.barber_id": req.body.barber_id,
				"chairs.$.barber_name": req.body.barber_name,
				"chairs.$.availability": "booked"
			}
		};
	}
	/*
	1. In case of if type is weekly then booking_end date is one week ahead
	2. In case of if type is percentage then booking_end date is one month ahead
	3. In case of if type is monthly then booking_end date is one month ahead
	*/
	console.log(updateCollectionData);
	var shopId = objectID.isValid(req.headers.shop_id)
	var chairId = objectID.isValid(req.body.chair_id)
	var barbrId = objectID.isValid(req.body.barber_id)
	if (shopId && chairId && barbrId) {
		async.waterfall([
			function(done) {
				var saveData = req.body;
				saveData.shop_id = req.headers.shop_id;
				saveData.release_date = bookingEndDate;
				chairBook(saveData).save(function(err, result) {
					if (err) {
						return res.status(400).send({
							msg: "Error in chair book collection."
						})
					} else {
						done(err, "Chair successfully booked.")
					}
				})
			},
			function(message, done) {
				chairRequest.update({
					_id: req.body.chair_request_id
				}, {
					$set: {
						status: "confirm"
					}
				}, function(err, result) {
					if (err) {
						return res.status(400).send({
							msg: "Error in chair request collection."
						})
					} else {
						console.log("result in chairRequest", result);
						done(err, message, "Chair request successfully updated.")
					}
				})
			},
			function(message, chairReqeustMessage, done) {
				shop.update({
					"_id": req.headers.shop_id,
					"chairs._id": req.body.chair_id
				}, updateCollectionData, function(err, findalResult) {
					if (err) {
						return res.status(400).send({
							msg: "Error in updating the shop collection."
						})
					} else {
						res.send({
							msg: 'shop updated successfully',
							'msg1': message,
							'msg2': chairReqeustMessage
						});
						done(err)
					}
				})
			}
		])
	} else {
		res.status(400).send({
			msg: 'Your input is wrong.'
		});
	}
}


exports.barberChairReqests = function(req, res) {
	req.checkParams("shop_id", "Shop Id is required.").notEmpty();
	if (req.validationErrors()) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}

	var shop_id = mongoose.Types.ObjectId(req.params.shop_id);
	chairRequest.aggregate([{
		$match: {
			'shop_id': shop_id
		}
	}, {
		$lookup: {
			from: 'shops',
			localField: 'chair_id',
			foreignField: 'chairs._id',
			as: 'shopChairInfo'
		}
	}, {
		$lookup: {
			from: 'users',
			localField: 'barber_id',
			foreignField: '_id',
			as: 'barberInfo'
		}
	}, {
		$unwind: "$shopChairInfo"
	}, {
		$unwind: "$shopChairInfo.chairs"
	}, {
		$project: {
			_id: 1,
			booking_date: 1,
			status: 1,
			barberInfo: {
				_id: 1,
				first_name: 1,
				last_name: 1,
				picture: 1
			},
			shopChairInfo: {
				_id: 1,
				name: 1,
				chairs: 1
			},
			isChairMatching: {
				$eq: ['$chair_id', '$shopChairInfo.chairs._id']
			}
		}
	}, {
		$match: {
			isChairMatching: true
		}
	}]).exec(function(err, chairRequest) {
		if (err) {
			res.status(400).send({
				'msg': constantObj.messages.errorRetreivingData,
				'err': err
			})
		} else {
			res.status(200).send({
				'msg': constantObj.messages.successRetreivingData,
				'imagesPath': 'http://' + req.headers.host + '/' + 'uploadedFiles/',
				'result': chairRequest

			});
		}
	});
}