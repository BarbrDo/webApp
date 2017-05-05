var User = require('../models/User');
var shop = require('../models/shop');
var constantObj = require('./../constants.js');
exports.allShops = function(req, res) {
	console.log(req.headers);
	console.log(req.body);
	if (req.headers.device_latitude && req.headers.device_longitude) {
		var long = parseFloat(req.headers.device_longitude);
		var lati = parseFloat(req.headers.device_latitude);
		var maxDistanceToFind = 500000;
		// User.aggregate([{
		// 	$geoNear: {
		// 		near: {
		// 			type: "Point",
		// 			coordinates: [long, lati]
		// 		},
		// 		distanceField: "dist.calculated",
		// 		maxDistance: maxDistanceToFind,
		// 		query: {
		// 			user_type: "shop"
		// 		},
		// 		includeLocs: "dist.location",
		// 		spherical: true
		// 	}
		// }, {
		// 	$lookup: {
		// 		from: "shops",
		// 		localField: "_id",
		// 		foreignField: "user_id",
		// 		as: "shop"
		// 	}
		// }]).exec(function(err, data) {
		// 	if (err) {
		// 		console.log(err);
		// 	} else {
		// 		res.status(200).send({
		// 			"msg": constantObj.messages.successRetreivingData,
		// 			"data": data
		// 		})
		// 	}
		// })

		var point = {
			type: "Point",
			coordinates: [long, lati]
		};
		shop.geoNear(point, {
			maxDistance: maxDistanceToFind,
			spherical: true
		}, function(err, results) {
			if (err) {
				res.status(400).send({
					"msg": constantObj.messages.errorRetreivingData,
					"err": err
				})
			} else {
				res.status(200).send({
					"msg": constantObj.messages.successRetreivingData,
					"data": results
				})
			}
		});
	} else {
		res.status(400).send({
			"msg": constantObj.messages.requiredFields
		})
	}
}

exports.shopContainsBarber = function(req, res) {
	req.assert('shop_id', 'Shop id is required').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send({
			msg: "error in your request",
			err: errors
		});
	}
	shop.find({
		_id: req.body.shop_id
	}).populate('chairs.barber_id').exec(function(err, result) {
		if (err) {
			return res.status(400).send({
				msg: "error in your request",
				err: errors
			});
		} else {
			res.status(200).send({
				"msg": constantObj.messages.successRetreivingData,
				"data": result
			})
		}
	})
}