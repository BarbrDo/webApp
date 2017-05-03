let objectID = require('mongodb').ObjectID;
let constantObj = require('./../constants.js');
let appointment = require('../models/appointment');
let moment = require('moment');
exports.takeAppointment = function(req, res) {
	req.assert("shop_id", "shop_id cannot be blank").notEmpty();
	req.assert("shop_name", "shop_name cannot be blank").notEmpty();
	req.assert("barber_id", "barber_id cannot be blank").notEmpty();
	req.assert("barber_name", "barber_name cannot be blank").notEmpty();
	req.assert("customer_id", "customer_id cannot be blank").notEmpty();
	req.assert("customer_name", "customer_name cannot be blank").notEmpty();
	req.assert("servies", "servies cannot be blank").notEmpty();
	req.assert("appointment_date", "appointment_date cannot be blank").notEmpty();
	req.assert("tax_amount", "tax_amount cannot be blank").notEmpty();
	req.assert("tax_percent", "tax_percent cannot be blank").notEmpty();
	req.assert("amount", "amount cannot be blank").notEmpty();
	req.assert("currency_code", "currency_code cannot be blank").notEmpty();
	req.assert("payment_method", "payment_method cannot be blank").notEmpty();
	if (req.body.payment_method == 'card') {
		req.assert("card_lastfourdigit", "card_lastfourdigit cannot be blank").notEmpty();
	}
	// req.assert("payment_status", "payment_status cannot be blank").notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	var saveData = req.body;
	appointment(saveData).save(function(err, data) {
		if (err) {
			return res.status(400).send({
				msg: constantObj.messages.errorInSave
			});
		} else {
			return res.status(200).send({
				msg: constantObj.messages.saveSuccessfully,
				data: data
			});
		}
	})
}

exports.customerAppointments = function(req, res) {
	req.assert("customer_id", "Customer id cannot be blank").notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	var currentDate = moment().format("YYYY-MM-DD");
	appointment.find({
		"customer_id": req.body.customer_id,
		"appointment_date": {
			$gte: currentDate
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
}

exports.customerCompletedAppointments = function(req, res) {
	req.assert("customer_id", "Customer id cannot be blank").notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	var currentDate = moment().format("YYYY-MM-DD");
	appointment.find({
		"customer_id": req.body.customer_id,
		"appointment_status":"completed",
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
}