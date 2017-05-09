var shop = require('../models/shop');
var constantObj = require('./../constants.js');

exports.editShop = function(req, res) {
    var updateData = JSON.parse(JSON.stringify(req.body));
    updateData.modified_date = new Date();
    delete updateData._id;
    if ((req.files) && (req.files.length > 0)) {
        var userimg = [];
        for (var i = 0; i < req.files.length; i++) {
            if (req.files[i].fieldname == 'image') {
                updateData.image = req.files[i].filename;
            } else {
                var obj = {};
                obj.name = req.files[i].filename;
                userimg.push(obj);
            }
        }
        updateData.gallery = userimg;
    }
    if (req.headers.device_latitude && req.headers.device_longitude) {
        updateData.latLong = [req.headers.device_longitude, req.headers.device_latitude]
    }
    console.log("updateData", updateData);
    shop.update({
        _id: req.body._id
    }, updateData, function(err, data) {
        if (err) {
            res.status(400).send({
                msg: 'Error in updating data.',
                "err": err
            });
        } else {
            res.status(200).send({
                msg: 'Successfully updated fieldssss.',
                "data": data
            });
        }
    })
}
exports.shopContainsBarber = function(req, res) {
    req.checkParams('shop_id', 'Shop id is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    shop.find({
        _id: req.params.shop_id
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
exports.allShops = function(req, res) {
    if (req.headers.device_latitude && req.headers.device_longitude) {
        var long = parseFloat(req.headers.device_longitude);
        var lati = parseFloat(req.headers.device_latitude);
        var maxDistanceToFind = constantObj.distance.shopDistance;
        shop.aggregate([{
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long, lati]
                },
                distanceField: "dist.calculated",
                distanceMultiplier: 0.000621371,// in miles in km 0.001
                maxDistance: maxDistanceToFind,
                includeLocs: "dist.location",
                spherical: true
            }
        }, {
            $unwind: "$chairs"
        }, {
            $lookup: {
                from: "users",
                localField: "chairs.barber_id",
                foreignField: "_id",
                as: "barberInformation"
            }
        }]).exec(function(err, data) {
            if (err) {
                console.log(err);
            } else {
                let resultTantArray = [];
                for (var i = 0; i < data.length; i++) {
                    var obj = {};
                    var totalbarbers = 0;
                    for (var j = 0; j < data.length; j++) {
                        if (data[i]._id == data[j]._id && data[j].barberInformation.length > 0) {
                            ++totalbarbers
                        }
                    }
                    if (totalbarbers > 0) {
                        obj._id = data[i]._id;
                        obj.shopName = data[i].name;
                        obj.gallery = data[i].gallery;
                        obj.distance = data[i].dist.calculated;
                        obj.barbers = totalbarbers

                        resultTantArray.push(obj);
                    }
                }
                res.status(200).send({
                    "msg": constantObj.messages.successRetreivingData,
                    "data": resultTantArray
                })
            }
        })

    } else {
        res.status(400).send({
            "msg": constantObj.messages.requiredFields
        })
    }
}

exports.allBarbers = function(req, res) {
        if (req.headers.device_latitude && req.headers.device_longitude) {
            var long = parseFloat(req.headers.device_longitude);
            var lati = parseFloat(req.headers.device_latitude);
            var maxDistanceToFind = constantObj.distance.shopDistance;// in miles in km 0.001
            shop.aggregate([{
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [long, lati]
                    },
                    distanceField: "dist.calculated",
                    distanceMultiplier: 0.000621371, // it returns distance in kilometers
                    maxDistance: maxDistanceToFind,
                    includeLocs: "dist.location",
                    spherical: true
                }
            }, {
                $unwind: "$chairs"
            }, {
                $lookup: {
                    from: "users",
                    localField: "chairs.barber_id",
                    foreignField: "_id",
                    as: "barberInformation"
                }
            }]).exec(function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    let resultTantArray = [];
                    for (var i = 0; i < data.length; i++) {
                        var obj = {};
                        if (data[i].barberInformation.length > 0) {
                            obj._id = data[i].barberInformation[0]._id;
                            obj.first_name = data[i].barberInformation[0].first_name;
                            obj.last_name = data[i].barberInformation[0].last_name;
                            obj.distance = data[i].dist.calculated;
                            obj.createdAt = data[i].barberInformation[0].created_date;
                            obj.rating = data[i].barberInformation[0].ratings;
                            obj.location = data[i].name
                            resultTantArray.push(obj);
                        }
                    }
                    res.status(200).send({
                        "msg": constantObj.messages.successRetreivingData,
                        "data": resultTantArray
                    })
                }
            })

        } else {
            res.status(400).send({
                "msg": constantObj.messages.requiredFields
            })
        }
    }
    // var refineDataForShop = function(req,res,data) {
    //     let resultTantArray = [];
    //     for (var i = 0; i < data.length; i++) {
    //         var obj = {};
    //         var totalbarbers = 0;
    //         for (var j = 0; j < data.length; j++) {
    //             if (data[i]._id == data[j]._id && data[j].barberInformation.length > 0) {
    //                 ++totalbarbers
    //             }
    //         }
    //         if (totalbarbers > 0) {
    //             obj.shopName = data[i].name;
    //             obj.gallery = data[i].gallery;
    //             obj.distance = data[i].dist.calculated;
    //             obj.barbers = totalbarbers

//             resultTantArray.push(obj);
//         }
//     }
//     res.status(200).send({
//         "msg": constantObj.messages.successRetreivingData,
//         "data": resultTantArray
//     })

// }

// var refineDataForBarbers = function(req, res, data) {
//     console.log("data", data.length);
//     let resultTantArray = [];
//     for (var i = 0; i < data.length; i++) {
//         var obj = {};
//         if (data[i].barberInformation.length > 0) {
//             obj.first_name = data[i].barberInformation[0].first_name;
//             obj.last_name = data[i].barberInformation[0].last_name;
//             obj.createdAt = data[i].barberInformation[0].created_date;
//             obj.rating = data[i].barberInformation[0].ratings;
//             obj.location = data[i].name
//             resultTantArray.push(obj);
//         }
//     }
//     res.status(200).send({
//         "msg": constantObj.messages.successRetreivingData,
//         "data": resultTantArray
//     })
// }