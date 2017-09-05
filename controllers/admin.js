let crypto = require('crypto');
let Admin = require('../models/admin');
let Plan = require('../models/plans');
let jwt = require('jsonwebtoken');
let constantObj = require('./../constants.js');
let moment = require('moment');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

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
	console.log(req.files);
	if(req.files.length>0){
		saveData.picture = req.files[0].filename
	}
	Admin.findOne({
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
			Admin(saveData).save(function(err, data) {
				if (err) {
					return res.status(400).send({
						msg: constantObj.messages.errorInSave,
						"err": err
					})
				} else {
					console.log(data);
					res.status(200).send({
						user: user,
						token: generateToken(data),
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
	console.log("saveData", saveData);
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
exports.getPlans = function(req, res) {
	req.checkHeaders("device_type", "Device type is required.").notEmpty();
	let errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	var device_type = req.headers.device_type.toLowerCase();
	Plan.find({apple_id:{$ne:"free"}}, function(err, data) {
		res.status(200).send({
			msg: constantObj.messages.successRetreivingData,
			data: data
		});
	})
}
exports.getallPlans = function(req, res) {
	Plan.find({
		"is_deleted": false,
		"is_active": true
	}, function(err, data) {
		res.status(200).send({
			msg: constantObj.messages.successRetreivingData,
			data: data
		});
	})
}
exports.getCurrentPlan = function(req, res) {
	console.log("req.", req.params);
	Plan.findOne({
		_id: req.params.id
	}, function(err, data) {
		res.status(200).send({
			msg: constantObj.messages.successRetreivingData,
			data: data
		});
	})
}
exports.updatePlan = function(req, res) {
	req.assert('name', 'First name cannot be blank.').notEmpty();
	req.assert('duration', 'Last name cannot be blank.').notEmpty();
	req.assert('price', 'price is not valid').notEmpty();
	req.assert('short_description', 'short_description required.').notEmpty();
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
	let plan = {
		name: req.body.name,
		duration: req.body.duration,
		price: req.body.price,
		short_description: req.body.short_description
	}
	if (req.body.google_id) {
		plan.google_id = req.body.google_id;
	}
	if (req.body.apple_id) {
		plan.apple_id = req.body.apple_id
	}
	Plan.update({
		_id: req.body._id
	}, {
		$set: plan
	}, function(err, data) {
		if (err) {
			return res.status(400).send({
				msg: constantObj.messages.userStatusUpdateFailure,
				"err": err
			})
		} else {
			res.status(200).send({
				msg: constantObj.messages.userStatusUpdateSuccess,
				data: data
			});
		}
	})
}
exports.giftCard = function(req, res) {
	let auth = {
		auth: {
			api_key: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN
		}
	}
	let nodemailerMailgun = nodemailer.createTransport(mg(auth))
	let messages = req.body.content;
	var mailOptions = {
		from: constantObj.messages.email,
		// to: req.body.to,
		to: 'hshussain86@gmail.com',
		subject: 'gift card from BarbrDo',
		text: messages
	};

	nodemailerMailgun.sendMail(mailOptions, function(err) {
		return res.status(200).send({
			msg: constantObj.messages.emailsend
		});
	});
}
exports.getAdminInfo = function(req,res){
	Admin.findOne({_id:req.body._id},function(err,data){
		res.status(200).send({
			msg:"Data retireve successfully",
			data:data
		})
	})
}
exports.updateAdminInfo = function(req,res){
	let updateData = {
		first_name:req.body.first_name,
		last_name:req.body.last_name,
		mobile_number:req.body.mobile_number,
		email:req.body.email
	}
	Admin.update({_id:req.body._id},{$set:updateData},function(err,data){
		if (err) {
			return res.status(400).send({
				msg: constantObj.messages.userStatusUpdateFailure,
				"err": err
			})
		} else {
			res.status(200).send({
				msg: constantObj.messages.userStatusUpdateSuccess,
				data: data
			});
		}
	})
}
exports.updatePassword = function(req, res) {
	if ('password' in req.body) {
		req.checkHeaders('_id', 'User ID is missing').notEmpty();
		req.assert('password', 'Password must be at least 6 characters long').len(6);
		req.assert('confirm', 'Passwords must match').equals(req.body.password);
	}
	Admin.findById(req.body._id, function(err, user) {
		if ('password' in req.body) {
			user.password = req.body.password;
		}
		user.save(function(err) {
			if ('password' in req.body) {
				res.send({
					msg: 'Your password has been changed.',
					user: user
				});
			}
		})
	})
}
exports.allAdmin = function(req,res){
	Admin.find({},function(err,data){
		res.send({
			data:data
		})
	})
}