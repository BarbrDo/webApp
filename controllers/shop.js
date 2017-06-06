let shop = require('../models/shop');
let user = require('../models/User');
let constantObj = require('./../constants.js');
let chairRequest = require('../models/chair_request');
let mongoose = require('mongoose');
exports.editShop = function(req, res) {
    console.log("user_id",req.body._id);
    console.log("req.body",req.body);
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
        _id: req.body._id
    }, {
        $push: {
            gallery: {
                $each: updateData.gallery
            }
        }
    }, function(err, data) {
        if (err) {
            res.status(400).send({
                msg: 'Error in updating data.',
                "err": err

            });
        } else {
            if (data.nModified == 1) {
                var response = {
                    "message": "Successfully updated fieldssss.",
                    "data": data
                };
            } else {
                var response = {
                    "message": "No record updated.",
                    "data": data
                };
            }
            res.status(200).json(response);
        }
    })
}
exports.shopContainsBarber = function(req, res) {
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
    }).populate('chairs.barber_id').exec(function(err, result) {
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
exports.allShops = function(req, res) {
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
            $match: {
                "name": {
                    $regex: search,
                    $options: 'i'
                }
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

//Get all barber associated with shops
exports.associatedBarbers = function(req, res) {
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
        }, {
            $unwind: "$barberInformation"
        }, {
            $match: {
                $or: [{
                    "barberInformation.first_name": {
                        $regex: search,
                        $options: 'i'
                    }
                }, {
                    "barberInformation.last_name": {
                        $regex: search,
                        $options: 'i'
                    }
                }]
            }
        }]).exec(function(err, data) {
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
                        obj.ratings = data[i].barberInformation.ratings;
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

exports.allShopsHavingChairs = function(req, res) {
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
            $match: {
                "name": {
                    $regex: search,
                    $options: 'i'
                }
            }
        }]).exec(function(err, result) {
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
exports.setChairPercentage = function(req, res) {
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
    }, updateCollectionData, function(err, result) {
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
exports.weeklyMonthlyChair = function(req, res) {
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
    }, updateCollectionData, function(err, result) {
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
exports.postChairToAllBarbers = function(req, res) {
    req.checkHeaders('user_id', 'Shop id is required.').notEmpty();
    req.checkHeaders('device_longitude', 'device_longitude id is required.').notEmpty();
    req.checkHeaders('device_latitude', 'device_latitude is required.').notEmpty();
    req.assert('shop_name', 'Shop name is requred.').notEmpty();
    req.assert('chair_id', 'Chair id is required.').notEmpty();
    let obj = {};
    if (req.body.type) {
        req.assert('type', 'Chair type is required.').notEmpty();
        obj.type = req.body.type;
    } else {
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
        $match: {
            "user_type": "barber"
        }
    }]).exec(function(err, result) {
        if (err) {
            return res.status(400).send({
                msg: "Error in Finding users."
            })
        } else {
            chairRequsett(result, req.headers.user_id, req.body.chair_id, obj, req.body.shop_name);
            res.status(200).send({
                msg: 'Your request is successfully considered.'
            });
        }
    })
}
var chairRequsett = function(data, userId, chairId, obj, shop_name) {
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
        } else {
            saveData.shop_percentage = obj.shop_percentage;
            saveData.barber_percentage = obj.barber_percentage
        }
        chairRequest(saveData).save(function(err, result) {
            if (err) {

            } else {
                --len;
                if (len >= 1) {
                    chairRequset(data, userId, chairId, obj, shop_name)
                } else {
                    return true;
                }
            }
        })
    }
}
exports.updateshop = function(req, res) {
    
    user.findById(req.params.id, function(err, shops) {
        shops = new user(req.body);
        shops.update(req.body, function(err, count) {
            console.log("count", count);
        });
    });
    shop.findById(req.body.shopinfo[0]._id, function(err, shops) {
        shops = new shop(req.body);
        shops.update(req.body.shopinfo[0], function(err, count) {
            console.log("hash", count);
        });
    });
};




 exports.listshops = function(req, res) {
    var page = req.body.page || 1,
        count = req.body.count || 50;
    var skipNo = (page - 1) * count;
    var query = {};
        query.user_type = "shop"
    var searchStr = req.body.search;

    if (req.body.search) {
        query.$or = [{
            name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            city: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            state: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            address: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }

    user.aggregate([{
        $match: query
    }
    ]).exec(function(err, data) {
        
        if (err) {
            console.log(err)
        } else {
            user.aggregate([{
                $match: query
            }, {
                "$skip": skipNo
            }, {
                "$limit": count
            }, {
            $lookup: {
                from: "shops",
                localField: "_id",
                foreignField: "user_id",
                as: "shopinfo"
                }
            }
        ]).exec(function(err, result) {
                var length = result.length;
                if(err){
                        res.status(400).send({
                        "msg": constantObj.messages.userStatusUpdateFailure,
                        "err": err
                    });
                }else{
                    res.status(200).send({
                        "msg": constantObj.messages.successRetreivingData,
                        "data": result,
                        "count": length
                    })
                }
            })
        }
    })
};


exports.availableBarber = function(req, res) {
    var page = req.body.page || 1,
        count = req.body.count || 10;
    var skipNo = (page - 1) * count;
    var query = {};
    query.user_type = "barber"
    var searchStr = req.body.search;


    
    user.aggregate([{
        $project: {
            _id: "$_id",
            first_name: "$first_name",
            last_name: "$last_name",
            email: "$email",
            mobile_number: "$mobile_number",
            ratings: "$ratings",
            created_date: "$created_date",
            isDeleted: "$isDeleted",
            isActive: "$isActive",
            is_verified: "$is_verified",
            user_type: "$user_type"
        }
    }, {
        $match: query
    }]).exec(function(err, data) {
        if (err) {
            console.log(err)
        } else {
            var length = data.length;
            user.aggregate([{
                $lookup: {
                    from: "shops",
                    "localField": "_id",
                    "foreignField": "chairs.barber_id",
                    "as": "shopdetails"
                }
            }, {
                $project: {
                    _id: "$_id",
                    first_name: "$first_name",
                    last_name: "$last_name",
                    email: "$email",
                    mobile_number: "$mobile_number",
                    created_date: "$created_date",
                    ratings: "$ratings",
                    isDeleted: "$isDeleted",
                    isActive: "$isActive",
                    is_verified: "$is_verified",
                    user_type: "$user_type",
                    password: "$password",
                    name: "$shopdetails.name",
                    shop: "$shopdetails"
                }
            }, {
                $match: query
            }, {
                "$skip": skipNo
            }, {
                "$limit": count
            }]).exec(function(err, result) {
                if (err) {
                    outputJSON = {
                        'status': 'failure',
                        'messageId': 203,
                        'message': 'data not retrieved '
                    };
                } else {
                    outputJSON = {
                        'status': 'success',
                        'messageId': 200,
                        'message': 'data retrieve from barber',
                        'data': result,
                        'count': length
                    }
                }
                res.status(200).jsonp(outputJSON);
            })
        }
    })

    if (req.body.search) {
        query.$or = [{
            first_name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            last_name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            email: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            ratings: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            created_date: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            mobile_number: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }
};
exports.getDataForBookNowPage = function(req, res) {
    if (req.headers.device_latitude && req.headers.device_longitude) {
        let long = parseFloat(req.headers.device_longitude);
        let lati = parseFloat(req.headers.device_latitude);
        let maxDistanceToFind = constantObj.distance.shopDistance;
        req.checkParams('shop_id', 'Shop id is required').notEmpty();
        req.checkParams('barber_id', 'Barber id is required').notEmpty();
        let errors = req.validationErrors();
        if (errors) {
            return res.status(400).send({
                msg: "error in your request",
                err: errors
            });
        }

        console.log("req.params.shop_id",req.params.shop_id);
        console.log("req.params.barber_id",req.params.barber_id);


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
            $match: {
                "_id": mongoose.Types.ObjectId(req.params.shop_id),
                "chairs.barber_id": mongoose.Types.ObjectId(req.params.barber_id)
            }
        }, {
            $unwind: "$chairs"
        }, {
            $match: {
                "_id": mongoose.Types.ObjectId(req.params.shop_id),
                "chairs.barber_id": mongoose.Types.ObjectId(req.params.barber_id)
            }
        }, {
            $lookup: {
                from: "users",
                localField: "chairs.barber_id",
                foreignField: "_id",
                as: "barberInformation"
            }
        }, {
            "$group": {
                "_id": "$_id",
                "distance": {
                    "$first": "$dist.calculated"
                },
                "shopName": {
                    "$first": "$name"
                },
                "barberfname": {
                    "$first": "$barberInformation.first_name"
                },
                "barberlname": {
                    "$first": "$barberInformation.last_name"
                },
                "rating": {
                    "$first": "$barberInformation.rating"
                }
            }
        }]).exec(function(err, result) {
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



exports.deleteshop = function(req, res) {
    console.log(req.params.shop_id);
    user.update({
        _id: req.params.shop_id
    }, {
        $set: {
            isDeleted: true
        }
    }, function(err, count) {
        user.find({
            isDeleted: false,
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};
exports.shopContainsChairs = function(req,res){
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
    }).exec(function(err, result) {
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
