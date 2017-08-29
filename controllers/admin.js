let crypto = require('crypto');
let Admin = require('../models/admin');
let Plan = require('../models/plans');
let jwt = require('jsonwebtoken');
let constantObj = require('./../constants.js');
let moment = require('moment');

function generateToken(user) {
	let payload = {
		iss: 'my.domain.com',
		sub: user._id,
		iat: moment().unix(),
		exp: moment().add(2, 'days').unix()
	};
	return jwt.sign(payload, process.env.TOKEN_SECRET);
}

exports.login = function(req, res) {
	req.assert('email', 'Email is not valid').isEmail();
	req.assert('email', 'Email cannot be blank').notEmpty();
	req.assert('password', 'Password cannot be blank').notEmpty();
	req.sanitize('email').normalizeEmail({
		remove_dots: false
	});
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "Missing required fields.",
			err: errors
		});
	}
	Admin.findOne({
		email: req.body.email
	}).exec(function(err, user) {
		console.log(user);
		if (!user) {
			return res.status(401).send({
				msg: 'The email address ' + req.body.email + ' is not associated with any account. ' + 'Double-check your email address and try again.'
			});
		}
		/*-- this condition is for check that this account is active or not---- */
		user.comparePassword(req.body.password, function(err, isMatch) {
			if (!isMatch) {
				return res.status(401).send({
					msg: 'Invalid email or password'
				});
			} else {
				res.status(200).send({
					token: generateToken(user),
					user: user.toJSON(),
					"imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
				});
			}
		})
	})
}

exports.signupPost = function(req, res, next) {
	req.assert('first_name', 'First name cannot be blank.').notEmpty();
	req.assert('last_name', 'Last name cannot be blank.').notEmpty();
	req.assert('email', 'Email is not valid').isEmail();
	req.assert('email', 'Email cannot be blank').notEmpty();
	req.assert('mobile_number', 'Mobile number cannot be blank').notEmpty();
	req.assert('password', 'Password cannot be blank').notEmpty();
	req.sanitize('email').normalizeEmail({
		remove_dots: false
	});

	let errors = req.validationErrors();
	if (errors) {
		res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	let saveData = req.body;
	User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (user) {
			return res.status(400).send({
				msg: 'The email address you have entered is already associated with another account.',
				err: [{
					msg: "The email address you have entered is already associated with another account."
				}]
			});
		} else {
			User(saveData).save(function(err, data) {
				if (err) {
					return res.status(400).send({
						msg: constantObj.messages.errorInSave,
						"err": err
					})
				} else {
					res.status(200).send({
						user: user,
						token: generateToken(user),
						"imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
					});
				}
			})
		}
	})
}

exports.createPlan = function(req, res) {
	req.assert('name', 'First name cannot be blank.').notEmpty();
	req.assert('duration', 'Last name cannot be blank.').notEmpty();
	req.assert('price', 'price is not valid').notEmpty();
	if (!(req.body.apple_id || req.body.google_id)) {
		return res.status(400).send({
			"msg": "Apple_id or Google_id is required."
		})
	} 
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	let saveData = req.body;
	console.log("saveData",saveData);
	Plan(saveData).save(function(err, result) {
		if (err) {
			return res.status(400).send({
				msg: constantObj.messages.errorInSave,
				"err": err
			})
		} else {
			res.status(200).send({
				msg: constantObj.messages.saveSuccessfully,
				data: result
			});
		}
	})
}
exports.getPlans = function(req,res){
	req.checkHeaders("device_type","Device type is required.").notEmpty();
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	var device_type = req.headers.device_type.toLowerCase();
	Plan.find({},function(err,data){
		res.status(200).send({
				msg: constantObj.messages.successRetreivingData,
				data: data
			});
	})
}
exports.getallPlans = function(req,res){
	Plan.find({"is_deleted" : false,"is_active" : true},function(err,data){
		res.status(200).send({
				msg: constantObj.messages.successRetreivingData,
				data: data
			});
	})
}
exports.getCurrentPlan = function(req,res){
	console.log("req.",req.params);
	Plan.findOne({_id:req.params.id},function(err,data){
		res.status(200).send({
				msg: constantObj.messages.successRetreivingData,
				data: data
			});
	})
}