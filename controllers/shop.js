let shop = require('../models/shop');
let user = require('../models/User');
let constantObj = require('./../constants.js');
let chairRequest = require('../models/chair_request');

exports.editShop = function (req, res) {
    let updateData = JSON.parse(JSON.stringify(req.body));
    updateData.modified_date = new Date();
    delete updateData._id;
    if ((req.files) && (req.files.length > 0)) {
        let userimg = [];
        for (let i = 0; i < req.files.length; i++) {
            if (req.files[i].fieldname == 'image') {
                updateData.picture = req.files[i].filename;
            } else {
                let obj = {};
                obj.name = req.files[i].filename;
                userimg.push(obj);
            }
        }
        updateData.gallery = userimg;
    }
    if (req.headers.device_latitude && req.headers.device_longitude) {
        updateData.latLong = [req.headers.device_longitude, req.headers.device_latitude]
    }
    user.update({
        _id: req.headers.user_id
    }, {
            $push: {
                gallery: {
                    $each: updateData.gallery
                }
            }
        }, function (err, data) {
            if (err) {
                res.status(400).send({
                    msg: 'Error in updating data.',
                    "err": err
                });
            } else {
                if (data.nModified == 1) {
                    let response = {
                        "message": "Successfully updated fieldssss.",
                        "data": data
                    };
                } else {
                    let response = {
                        "message": "No record updated.",
                        "data": data
                    };
                }
                res.status(200).json(response);
            }
        })
}
exports.shopContainsBarber = function (req, res) {
    req.checkParams('shop_id', 'Shop id is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    shop.findOne({
        _id: req.params.shop_id
    }).populate('chairs.barber_id').exec(function (err, result) {
        if (err) {
            return res.status(400).send({
                msg: "error in your request",
                err: errors
            });
        } else {
            let resultTantArray = [];
            // add ratings of a barber in result.chairs[i].barber_id.ratings
            // add ratings of a barber in result.chairs[i].barber_id.gallery
            for (let i = 0; i < result.chairs.length; i++) {
                if (result.chairs[i].barber_id) {
                    let obj = {
                        _id: result.chairs[i].barber_id._id,
                        first_name: result.chairs[i].barber_id.first_name,
                        last_name: result.chairs[i].barber_id.last_name,
                        picture: result.chairs[i].barber_id.picture,
                        created_date: result.chairs[i].barber_id.created_date,
                        ratings: result.chairs[i].barber_id.ratings,
                        gallery: result.chairs[i].barber_id.gallery
                    }
                    resultTantArray.push(obj)
                }
            }
            res.status(200).send({
                "msg": constantObj.messages.successRetreivingData,
                "data": {
                    name: result.name,
                    _id: result._id,
                    state: result.state,
                    city: result.city,
                    latLong: result.latLong,
                    address: result.address,
                    gallery: result.gallery,
                    barber: resultTantArray,
                    imagesPath: 'http://' + req.headers.host + '/' + 'uploadedFiles/'
                }
            })
        }
    })
}
exports.allShops = function (req, res) {
    if (req.headers.device_latitude && req.headers.device_longitude) {
        let long = parseFloat(req.headers.device_longitude);
        let lati = parseFloat(req.headers.device_latitude);
        let maxDistanceToFind = constantObj.distance.shopDistance;
        let search = ""
        if (req.query.search) {
            search = req.query.search;
        }
        shop.aggregate([{
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long, lati]
                },
                distanceField: "dist.calculated",
                distanceMultiplier: constantObj.distance.distanceMultiplierInMiles, // in miles in km 0.001
                maxDistance: maxDistanceToFind,
                includeLocs: "dist.location",
                spherical: true
            }
        }, {
            $match: { "name": { $regex: search, $options: 'i' } }
        }, {
            $unwind: "$chairs"
        }, {
            $lookup: {
                from: "users",
                localField: "chairs.barber_id",
                foreignField: "_id",
                as: "barberInformation"
            }
        }]).exec(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let resultTantArray = [];
                for (let i = 0; i < data.length; i++) {
                    let obj = {};
                    let totalbarbers = 0;
                    for (let j = 0; j < data.length; j++) {
                        if (data[i]._id == data[j]._id && data[j].barberInformation.length > 0) {
                            ++totalbarbers
                        }
                    }
                    if (totalbarbers > 0) {
                        obj._id = data[i]._id;
                        obj.shopName = data[i].name;
                        obj.state = data[i].state;
                        obj.city = data[i].city;
                        obj.address = data[i].address;
                        obj.gallery = data[i].gallery;
                        obj.latLong = data[i].latLong;
                        let distt = parseFloat(data[i].dist.calculated)
                        distt = Math.round(distt * 100) / 100
                        obj.distance = distt;
                        obj.units = "miles";
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

exports.allBarbers = function (req, res) {
    if (req.headers.device_latitude && req.headers.device_longitude) {
        let long = parseFloat(req.headers.device_longitude);
        let lati = parseFloat(req.headers.device_latitude);
        let maxDistanceToFind = constantObj.distance.shopDistance; // in miles in km 0.001
        let search = ""
        if (req.query.search) {
            search = req.query.search;
        }
        shop.aggregate([{
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long, lati]
                },
                distanceField: "dist.calculated",
                distanceMultiplier: constantObj.distance.distanceMultiplierInMiles, // it returns distance in kilometers
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
        },
        {
            $unwind: "$barberInformation"
        }, {
            $match: {
                $or: [
                    { "barberInformation.first_name": { $regex: search, $options: 'i' } },
                    { "barberInformation.last_name": { $regex: search, $options: 'i' } }
                ]
            }
        }]).exec(function (err, data) {
            if (err) {
                console.log(err);
            } else {

                let resultTantArray = [];
                for (let i = 0; i < data.length; i++) {
                    let obj = {};
                    if (data[i].barberInformation) {
                        obj._id = data[i].barberInformation._id;
                        obj.first_name = data[i].barberInformation.first_name;
                        obj.last_name = data[i].barberInformation.last_name;
                        let distt = parseFloat(data[i].dist.calculated)
                        distt = Math.round(distt * 100) / 100
                        obj.distance = distt;
                        obj.units = "miles";
                        obj.created_date = data[i].barberInformation.created_date;
                        obj.rating = data[i].barberInformation.ratings;
                        obj.location = data[i].name;
                        obj.shop_id = data[i]._id;
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

exports.allShopsHavingChairs = function (req, res) {
    if (req.headers.device_latitude && req.headers.device_longitude) {
        let long = parseFloat(req.headers.device_longitude);
        let lati = parseFloat(req.headers.device_latitude);
        let maxDistanceToFind = constantObj.distance.shopDistance;
        let point = {
            type: "Point",
            coordinates: [long, lati]
        };
        let search = ""
        if (req.query.search) {
            search = req.query.search;
        }
        shop.aggregate([{
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long, lati]
                },
                distanceField: "dist.calculated",
                distanceMultiplier: constantObj.distance.distanceMultiplierInMiles, // in miles in km 0.001
                maxDistance: maxDistanceToFind,
                includeLocs: "dist.location",
                spherical: true
            }
        }, {
            $match: { "name": { $regex: search, $options: 'i' } }
        }]).exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.status(200).send({
                    "msg": constantObj.messages.successRetreivingData,
                    "data": result
                })
            }
        })
    } else {
        res.status(400).send({
            "msg": constantObj.messages.requiredFields
        })
    }
}
exports.setChairPercentage = function (req, res) {
    req.checkHeaders('user_id', 'Shop id is required.').notEmpty();
    req.assert('chair_id', 'Chair id is required.').notEmpty();
    req.assert('shop_percentage', 'Shop percentage is required.').notEmpty();
    req.assert('barber_percentage', 'Barber percentage is required.').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let updateCollectionData = {
        "$set": {
            "chairs.$.shop_percentage": parseInt(req.body.shop_percentage),
            "chairs.$.type": "",
            "chairs.$.barber_percentage": parseInt(req.body.barber_percentage)
        }
    };
    shop.update({
        "user_id": req.headers.user_id,
        "chairs._id": req.body.chair_id
    }, updateCollectionData, function (err, result) {
        if (err) {
            return res.status(400).send({
                msg: "Error in updating the shop collection."
            })
        } else {
            res.status(200).send({
                msg: 'shop updated successfully'
            });
        }
    })
}
exports.weeklyMonthlyChair = function (req, res) {
    req.checkHeaders('user_id', 'Shop id is required.').notEmpty();
    req.assert('chair_id', 'Chair id is required.').notEmpty();
    req.assert('type', 'Type is required.').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let updateCollectionData = {
        "$set": {
            "chairs.$.type": "",
            "chairs.$.type": req.body.type,
            "chairs.$.barber_percentage": ""
        }
    };
    shop.update({
        "user_id": req.headers.user_id,
        "chairs._id": req.body.chair_id
    }, updateCollectionData, function (err, result) {
        if (err) {
            return res.status(400).send({
                msg: "Error in updating the shop collection."
            })
        } else {
            res.status(200).send({
                msg: 'shop updated successfully'
            });
        }
    })
}
exports.postChairToAllBarbers = function (req, res) {
    req.checkHeaders('user_id', 'Shop id is required.').notEmpty();
    req.checkHeaders('device_longitude', 'device_longitude id is required.').notEmpty();
    req.checkHeaders('device_latitude', 'device_latitude is required.').notEmpty();
    req.assert('shop_name', 'Shop name is requred.').notEmpty();
    req.assert('chair_id', 'Chair id is required.').notEmpty();
    let obj = {};
    if (req.body.type) {
        req.assert('type', 'Chair type is required.').notEmpty();
        obj.type = req.body.type;
    }
    else {
        req.assert('shop_percentage', 'Shop percentage is required.').notEmpty();
        req.assert('barber_percentage', 'Barber percentage is required.').notEmpty();
        obj.shop_percentage = req.body.shop_percentage;
        obj.barber_percentage = req.body.barber_percentage;
    }
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let long = parseFloat(req.headers.device_longitude);
    let lati = parseFloat(req.headers.device_latitude);
    let maxDistanceToFind = constantObj.distance.shopDistance;
    user.aggregate([{
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [long, lati]
            },
            distanceField: "dist.calculated",
            distanceMultiplier: constantObj.distance.distanceMultiplierInMiles, // in miles in km 0.001
            maxDistance: maxDistanceToFind,
            includeLocs: "dist.location",
            spherical: true
        }
    }, {
        $match: { "user_type": "barber" }
    }]).exec(function (err, result) {
        if (err) {
            return res.status(400).send({
                msg: "Error in Finding users."
            })
        }
        else {
            chairRequsett(result, req.headers.user_id, req.body.chair_id, obj, req.body.shop_name);
            res.status(200).send({
                msg: 'Your request is successfully considered.'
            });
        }
    })
}
var chairRequsett = function (data, userId, chairId, obj, shop_name) {
    let len = data.length;
    console.log(len);
    console.log(data);
    var size = Object.keys(obj).length;
    console.log(size);
    for (var i = 0; i < data.length; i++) {
        let saveData = {
            shop_id: userId,
            chair_id: chairId,
            barber_id: data[i]._id,
            barber_name: data[i].first_name + " " + data[i].last_name,
            request_by: shop_name,
            booking_date: new Date(),
            status: "pending"
        }
        if (size == 1) {
            saveData.type = obj.type;
        }
        else {
            saveData.shop_percentage = obj.shop_percentage;
            saveData.barber_percentage = obj.barber_percentage
        }
        chairRequest(saveData).save(function (err, result) {
            if (err) {

            } else {
                --len;
                if (len >= 1) {
                    chairRequset(data, userId, chairId, obj, shop_name)
                }
                else {
                    return true;
                }
            }
        })
    }
}
