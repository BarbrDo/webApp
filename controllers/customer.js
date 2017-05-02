var User = require('../models/User');
var constantObj = require('./../constants.js');
exports.allShops = function(req, res) {
	if (req.headers.device_latitude && req.headers.device_longitude) {
		var long = parseFloat(req.headers.device_longitude);
		var lati = parseFloat(req.headers.device_latitude);
		var maxDistanceToFind = 50

		User.aggregate([{
			$geoNear: {
				near: {
					type: "Point",
					coordinates: [long, lati]
				},
				distanceField: "dist.calculated",
				maxDistance: maxDistanceToFind,
				query: {
					user_type: "shop"
				},
				includeLocs: "dist.location",
				spherical: true
			}
		}, {
			$lookup: {
				from: "shops",
				localField: "_id",
				foreignField: "user_id",
				as: "shop"
			}
		}]).exec(function(err,data){
			if(err){
				console.log(err);
			}
			else{
				res.status(200).send({
					"msg": constantObj.messages.successRetreivingData,
					"data":data
				})
			}
		})

		// var point = {
  //           type: "Point",
  //           coordinates: [long,lati]
  //       };
  //       User.geoNear(point, {
  //           maxDistance: maxDistanceToFind,
  //           spherical: true,
  //           query:{user_type:'shop'}
  //       }, function(err, results) {
  //           if(err){
		// 		res.status(400).send({
		// 			"msg": constantObj.messages.errorRetreivingData,
		// 			"err": err
		// 		})
  //           }
  //           else{
		// 		res.status(200).send({
		// 			"msg": constantObj.messages.successRetreivingData,
		// 			"data":results
		// 		})
  //           }
  //       });
	} else {
		res.status(400).send({
			"msg": constantObj.messages.requiredFields
		})
	}
}