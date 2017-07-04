let chairRequest = require('../models/chair_request');
let chairBook = require('../models/chair_booking');
let objectID = require('mongodb').ObjectID;
let constantObj = require('./../constants.js');
var shop = require('../models/shop');
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
let user = require('../models/User');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');
/**
 * Request to a particular chair
 * Input: check code req.assert lines
 * Output: chair saved success reponse
 * 
 */
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
	var d = new Date(req.body.booking_date);
	var bookDate = d.toISOString();
	chairRequest.find({
		shop_id: req.body.shop_id,
		chair_id: req.body.chair_id,
		barber_id: req.body.barber_id,
		status: "pending",
		booking_date: bookDate
	}).exec(function(err, resultCheck) {
		console.log("databae",resultCheck)
		if (err) {
			return res.status(400).send({
				msg: "error in your request",
				err: errors
			});
		} else {
			if (resultCheck.length > 0) {
				return res.status(400).send({
					msg: "Already requested",
					data: resultCheck
				});
			}

			var saveData = {};
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
						// This will validate that you can't add boooking more then one month
						if (bookDate < futureMonth && bookDate >= currentDate) {
							shop.findOne({
								"_id": req.body.shop_id,
								"chairs._id": req.body.chair_id
							}, {
								"chairs.$": 1
							}).exec(function(shopErr, shopResult) {

								if (shopResult != null && shopResult.chairs[0].availability == 'available') {
									saveData.shop_id = req.body.shop_id;
									saveData.chair_id = req.body.chair_id;
									saveData.chair_type = shopResult.chairs[0].type
									if (shopResult.chairs[0].type == 'weekly' || shopResult.chairs[0].type == 'monthly') {
										saveData.amount = shopResult.chairs[0].amount
									}
									if (shopResult.chairs[0].type == 'percentage') {
										saveData.shop_percentage = shopResult.chairs[0].shop_percentage
										saveData.barber_percentage = shopResult.chairs[0].barber_percentage
									}
									saveData.requested_by = data.user_type
									saveData.barber_id = req.headers.user_id
									saveData.booking_date = req.body.booking_date
									saveData.status = "pending";
									chairRequest(saveData).save(function(err, result) {
										if (err) {
											return res.status(400).send({
												msg: constantObj.messages.errorInSave
											})
										} else {
											mailChairRequest(data.email)
											res.status(200).send({
												msg: "Your request for shop is successfully registered.",
												data: result
											});
										}
									})
								} else {
									res.status(400).send({
										msg: "Booking not available at the moment."
									});
								}
							})
						} else {
							res.status(400).send({
								msg: "You cannot add Booking for more than one month or less then current date."
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
						
						shop.findOne({
							"_id": req.body.shop_id,
							"chairs._id": req.body.chair_id
						}, {
							"chairs.$": 1
						}).exec(function(shopErr, result) {
							console.log("database222",result)
							console.log("req.body",req.body)
							saveData = req.body;
							if (result != null && result.chairs[0].availability == 'available') {
								
								if (result.chairs[0].type == 'weekly' || result.chairs[0].type == 'monthly') {
									saveData.amount = result.chairs[0].amount
								}
								if (result.chairs[0].type == 'percentage') {
									saveData.shop_percentage = result.chairs[0].shop_percentage
									saveData.barber_percentage = result.chairs[0].barber_percentage
								}
								saveData.chair_type = result.chairs[0].type;
								saveData.shop_id = req.headers.user_id
								saveData.requested_by = data.user_type
								saveData.status = "pending";
								console.log("savedata",shop)
								chairRequest(saveData).save(function(err, shop) {
									console.log(shop)
									if (err) {
										return res.status(400).send({
											msg: constantObj.messages.errorInSave
										})
									} else {
										mailChairRequest(data.email)
										res.status(200).send({
											msg: "Your request for shop is successfully registered.",
											data: shop
										});
									}
								})

							} else {
								res.status(400).send({
									msg: "Booking not available at the moment."
								});
							}
						});
					}
				} else {
					res.status(400).send({
						msg: "User is not present.",
						data: data
					});
				}
			})
		}
	})
}

/*_________________________________________________
This function will sent Mail when a barber request to chair
Barber Request to chair :- to: shop_email, cc : admin
Shop request to barber for a chair :- to Barber_email,cc : admin
____________________________________________________
*/

let mailChairRequest = function(email) {
	let auth = {
		auth: {
			api_key: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN
		}
	}
	let nodemailerMailgun = nodemailer.createTransport(mg(auth));
	console.log('email', email);
	let mailOptions = {
		to: email,
		cc: constantObj.messages.email,
		from: 'support@barbrdo.com',
		subject: '✄ New Chair request.',
		text: 'You have a new chair request.'
	};

	nodemailerMailgun.sendMail(mailOptions, function(err, info) {
		console.log("mailSentChairRequest", err, info);
	});

}

exports.barberChairReqests = function(req, res) {
	req.checkParams("shop_id", "Shop Id is required.").notEmpty();
	console.log("shop id is", req.params.shop_id)
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}

	var shop_id = mongoose.Types.ObjectId(req.params.shop_id);
	chairRequest.aggregate([{
		$match: {
			shop_id: shop_id,
			requested_by: "barber",
			status: "pending"
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
			console.log(chairRequest)
			res.status(200).send({
				'msg': constantObj.messages.successRetreivingData,
				'imagesPath': 'http://' + req.headers.host + '/' + 'uploadedFiles/',
				'result': chairRequest

			});
		}
	});
}
exports.shopChairRequest = function(req, res) {
	console.log(req.params);
	req.checkParams("barber_id", "Barber Id is required.").notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	var barber_id = mongoose.Types.ObjectId(req.params.barber_id);
	chairRequest.aggregate([{
		$match: {
			'barber_id': barber_id,
			"requested_by": "shop",
			"status": "pending"
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
				chairs: 1,
				user_id: 1
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

exports.acceptRequest = function(req, res) {

	req.checkHeaders("user_id", "User Id is required.").notEmpty();
	req.assert("chair_request_id", "chair_request_id is required.").notEmpty() // Chair Request _id is required   
	req.assert("request_type", "request_type is required").notEmpty();

	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}

	if (req.body.request_type == 'accept') {
		let updateCollectionData = {};
		let bookingEndDate = "";
		let id = mongoose.Types.ObjectId(req.body.chair_request_id);
		chairRequest.aggregate([{
			$match: {
				_id: id
			}
		}, {
			$lookup: {
				from: "users",
				localField: "barber_id",
				foreignField: "_id",
				as: "barberInformation"
			}
		}]).exec(function(err, result) {
			console.log("here am i  in mongo", result)
			if (err) {
				return res.status(400).send({
					msg: "error in finding",
					err: err
				});
			} else {
				if (!result) {
					res.status(400).send({
						'msg': "Data for this chair request is not present."
					})
				}

				var currentDate = "";
				var futureMonth = "";
				var futureMonthEnd = "";
				if (result[0].chair_type == 'weekly') {
					let book_date = ""
					if (result[0].booking_date) {
						book_date = moment(result[0].booking_date).format("YYYY-MM-DD");
					} else {
						book_date = moment().format("YYYY-MM-DD");
					}
					bookingEndDate = moment(book_date).add(7, 'day')
					updateCollectionData = {
						"$set": {
							"chairs.$.booking_start": book_date,
							"chairs.$.booking_end": bookingEndDate,
							"chairs.$.barber_id": result[0].barber_id,
							"chairs.$.availability": "booked"
						}
					};
				} else if (result[0].chair_type == 'percentage') {
					if (result[0].booking_date) {
						currentDate = moment(result[0].booking_date).format("YYYY-MM-DD");
						currentDate = moment(currentDate)
						futureMonth = moment(currentDate).add(1, 'M');
						futureMonthEnd = moment(futureMonth).endOf('month');
						if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
							futureMonth = futureMonth.add(1, 'd');
						}
					} else {
						currentDate = moment().format("YYYY-MM-DD");
						currentDate = moment(currentDate)
						futureMonth = moment(currentDate).add(1, 'M');
						futureMonthEnd = moment(futureMonth).endOf('month');
						if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
							futureMonth = futureMonth.add(1, 'd');
						}
					}
					updateCollectionData = {
						"$set": {
							"chairs.$.booking_start": currentDate,
							"chairs.$.booking_end": futureMonth,
							"chairs.$.barber_id": result[0].barber_id,
							"chairs.$.availability": "booked"
						}
					}
				} else if (result[0].chair_type == 'monthly') {
					var currentDate = "";
					var futureMonth = "";
					var futureMonthEnd = "";
					if (result[0].booking_date) {
						currentDate = moment(result[0].booking_date).format("YYYY-MM-DD");
						currentDate = moment(currentDate)
						futureMonth = moment(currentDate).add(1, 'M');
						futureMonthEnd = moment(futureMonth).endOf('month');
						if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
							futureMonth = futureMonth.add(1, 'd');
						}
					} else {
						currentDate = moment().format("YYYY-MM-DD");
						currentDate = moment(currentDate)
						futureMonth = moment(currentDate).add(1, 'M');
						futureMonthEnd = moment(futureMonth).endOf('month');
						if (currentDate.date() != futureMonth.date() && futureMonth.isSame(futureMonthEnd.format('YYYY-MM-DD'))) {
							futureMonth = futureMonth.add(1, 'd');
						}
					}

					updateCollectionData = {
						"$set": {
							"chairs.$.booking_start": currentDate,
							"chairs.$.booking_end": futureMonth,
							"chairs.$.barber_id": result[0].barber_id,
							"chairs.$.availability": "booked"
						}
					}
				} else {
					return res.status(400).send({
						msg: "Chair type is not present."
					})
				}
				/*
				1. In case of if type is weekly then booking_end date is one week ahead
				2. In case of if type is percentage then booking_end date is one month ahead
				3. In case of if type is monthly then booking_end date is one month ahead */

				async.waterfall([
					function(done) {
						var saveData = {
							chair_id: result[0].chair_id,
							barber_id: result[0].barber_id,
							shop_id: result[0].shop_id,
							release_date: bookingEndDate,
							booking_date: result[0].booking_date
						}
						if (result[0].chair_type == 'percentage') {
							saveData.shop_percentage = result[0].shop_percentage
							saveData.barber_percentage = result[0].barber_percentage
						}
						if (result[0].chair_type == 'weekly' || result[0].chair_type == 'monthly') {
							saveData.amount = result[0].amount;
						}
						chairBook(saveData).save(function(err, output) {
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
						var bulk = chairRequest.collection.initializeUnorderedBulkOp();
						let query = {
							"chair_id": mongoose.Types.ObjectId(result[0].chair_id),
							"status": "pending"
						}
						let update = {
							"$set": {
								"status": "decline"
							}
						}
						bulk.find(query).update(update);
						bulk.execute(function(error, rlt) {

							// callback()
						});
						done(err, "all chair updated.")
					},
					function(message, done) {
						chairRequest.update({
							_id: id
						}, {
							$set: {
								status: "accept"
							}
						}, function(err, outt) {
							if (err) {
								return res.status(400).send({
									msg: "Error in chair request collection."
								})
							} else {

								done(err, message, "Chair request successfully updated.")
							}
						})
					},
					function(message, chairReqeustMessage, done) {
						shop.update({
							"_id": result[0].shop_id,
							"chairs._id": result[0].chair_id
						}, updateCollectionData, function(err, findalResult) {
							if (err) {
								return res.status(400).send({
									msg: "Error in updating the shop collection."
								})
							} else {
								res.send({
									msg: 'Shop chair request accepted successfully',
									'msg1': message,
									'msg2': chairReqeustMessage
								});
								done(err)
							}
						})
					}
				])
			}
		})
	} else if (req.body.request_type == 'decline') {
		let id = mongoose.Types.ObjectId(req.body.chair_request_id);
		chairRequest.update({
			_id: id
		}, {
			$set: {
				status: "decline"
			}
		}, function(err, outt) {
			if (err) {
				return res.status(400).send({
					msg: "Error in chair request collection."
				})
			} else {
				return res.status(200).send({
					msg: "Chair request is successfully declined."
				})
			}
		})
	} else {
		return res.status(400).send({
			msg: "Error in request"
		})
	}
}