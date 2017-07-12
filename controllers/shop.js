let shop = require('../models/shop');
let user = require('../models/User');
let constantObj = require('./../constants.js');
let chairRequest = require('../models/chair_request');
let mongoose = require('mongoose');
let geocoder = require('geocoder');

exports.updateShop = function(req, res) {
    console.log("req.body....", req.body);
    req.assert("_id", "Shop id is required.").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    var updateData = JSON.parse(JSON.stringify(req.body));
    if (req.body.zip) {
        geocoder.geocode(req.body.zip, function(errGeo, latlng) {
            if (errGeo) {
                return res.status(400).send({
                    msg: constantObj.messages.errorInSave
                })
            } else {
                updateData.latLong = [latlng.results[0].geometry.location.lng, latlng.results[0].geometry.location.lat];
                saveData(updateData, req.body._id, req, res);
            }

        });
    } else {
        saveData(updateData, req.body._id, req, res);
    }

};

var saveData = function(updateData, id, req, res) {
    shop.update({
        _id: id
    }, updateData, function(err, data) {
        if (err) {
            console.log("data", data);

            res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure,
                "err": err
            });
        } else {
            res.status(200).send({
                "msg": constantObj.messages.userStatusUpdateSuccess,
                "data": data,
                "shop": shop
            });
        }
    });
};

exports.shopContainsBarber = function(req, res) {
    req.checkParams('shop_id', 'Shop id is required').notEmpty();
    var errors = req.validationErrors();
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
            console.log(result);
            // add ratings of a barber in result.chairs[i].barber_id.ratings
            // add ratings of a barber in result.chairs[i].barber_id.gallery
            if(result.chairs){
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
                        picture:result.picture,
                        imagesPath: 'http://' + req.headers.host + '/' + 'uploadedFiles/'
                    }
                })
            } else {
                res.status(400).send({
                    msg: "error in your request"
                });
            }
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
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "shopOwner"
            }
        },
       {
         $project: {
            _id:1,
            user_id: 1,
            name: 1,
            address: 1,
            city: 1,
            state: 1,
            zip: 1,
            latLong: 1,
            phone: 1,
            license_number:1,
            created_date: 1,
            modified_date: 1,
            payment_methods: 1,
            ratings:1,
            shopOwner:1,
            chairs:1,
            distance:"$dist.calculated",
            units:{ $literal:  "miles"  },
            barbers: { $size: [ "$chairs.barber_id" ] }
         }
      }
      ]).exec(function(err, data) {
            if (err) {
                console.log(err);
            } else {
               console.log("here",data)
                /*let resultTantArray = [];
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
                        obj.name = data[i].name;
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
                }*/
                res.status(200).send({
                    "msg": constantObj.messages.successRetreivingData,
                    "data": data
                })
            }
        })

    } else {
        res.status(400).send({
            "msg": constantObj.messages.requiredFields
        })
    }
}

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
                        obj.picture = data[i].barberInformation.picture;
                        resultTantArray.push(obj);
                    }
                }
                console.log("database",data)
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
    console.log(req.headers);
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
        },{
            $unwind: "$chairs"
        },{
            $match:{
                "chairs.isActive":true,
                "chairs.availability" :{$ne:"closed"}
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'chairs.barber_id',
                foreignField: '_id',
                as: 'barberInfo'
            }
        },
        {
            $group:
            {
                '_id':{
                    _id : "$_id",
                    name:"$name",
                    user_id : "$user_id",
                    license_number : "$license_number",
                    latLong:"$latLong",
                    rating:"$rating",
                    payment_methods:"$payment_methods",
                    modified_date:"$modified_date",           
                    created_date : "$created_date",
                    zip:"$zip",
                    state:"$state",
                    city:"$city",
                    address:"$address",
                    ratings:"$ratings",
                    payment_method:"$payment_methods",
                    distance:"$dist.calculated"
                },
                'chair_barber': { 
                    $push: {
                        chair:"$chairs",
                        barber:"$barberInfo",
                    }
                }
            }
         },
        {
            $project:{
                '_id':1,
                'chair_barber':1
            }
        }
        ]).exec(function(err, result) {
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
    req.assert('_id', 'Chair id is required.').notEmpty();
    req.assert('shop_percentage', 'Shop percentage is required.').notEmpty();
    req.assert('barber_percentage', 'Barber percentage is required.').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    console.log(req.body)
    let updateCollectionData = {
        "$set": {
            "chairs.$.shop_percentage": parseInt(req.body.shop_percentage),
            "chairs.$.type": req.body.type,
            "chairs.$.barber_percentage": parseInt(req.body.barber_percentage),
            "chairs.$.amount": undefined
        }
    };
    shop.update({
        "user_id": req.headers.user_id,
        "chairs._id": req.body._id
    }, updateCollectionData, function(err, result) {
        if (err) {
            return res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure
            })
        } else {
            res.status(200).send({
                "msg": constantObj.messages.userStatusUpdateSuccess
            });
        }
    })
}

exports.weeklyMonthlyChair = function(req, res) {
    req.checkHeaders('user_id', 'Shop id is required.').notEmpty();
    req.assert('_id', 'Chair id is required.').notEmpty();
    req.assert('type', 'Type is required.').notEmpty();
    req.assert('amount', 'Amount is required.').notEmpty();
    console.log("headers1", req.headers.user_id);
    console.log("chair id1", req.body._id);
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let updateCollectionData = {
        "$set": {
            "chairs.$.type": req.body.type,
            "chairs.$.amount": req.body.amount,
            "chairs.$.shop_percentage": undefined,
            "chairs.$.barber_percentage": undefined,
        }
    };
    console.log("headers", req.headers.user_id);
    console.log("chair id", req.body._id);
    shop.update({
        "user_id": req.headers.user_id,
        "chairs._id": req.body._id
    }, updateCollectionData, function(err, result) {
        console.log("result", result);
        if (err) {
            return res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure
            })
        } else {
            res.status(200).send({
                "msg": constantObj.messages.userStatusUpdateSuccess
            });
        }
    })
}

exports.postChairToAllBarbers = function(req, res) {
    req.checkHeaders('user_id', 'Shop id is required.').notEmpty();
    req.assert('chair_id', 'Chair id is required.').notEmpty();
    if (req.validationErrors()) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let updateCollectionData = {
        "$set": {
            "chairs.$.availability": "available"
        }
    };
    shop.findOne({
        "user_id": req.headers.user_id,
        "chairs._id": req.body.chair_id
    }, {
        "chairs.$": 1
    }).exec(function(err, data) {
        console.log(data);
        if (data.chairs[0].type) {
            shop.update({
                "user_id": req.headers.user_id,
                "chairs._id": req.body.chair_id
            }, updateCollectionData, function(err, result) {
                if (err) {
                    return res.status(400).send({
                        "msg": constantObj.messages.userStatusUpdateFailure
                    })
                } else {
                    // chairRequsett(req.headers.user_id, req.body.chair_id)
                    res.status(200).send({
                        "msg": constantObj.messages.chairPostedSuccess
                    });
                }
            })
        } else {
            return res.status(400).send({
                "msg": "Please Enter the type of chair."
            })
        }
    })
}

exports.listshops = function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var count = parseInt(req.query.count) || 10;
    var skipNo = (page - 1) * count;
    var query = {};
    query.user_type = "shop";
    var searchStr = ""
    if (req.query.search) {
        searchStr = req.query.search;
    }
    if (searchStr) {
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
            location: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            name: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }

    user.aggregate([{
        $match: query
    }]).exec(function(err, data) {

        if (err) {
            console.log(err)
        } else {
            user.aggregate([{
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "shopinfo"
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
                    is_deleted: "$is_deleted",
                    is_active: "$is_active",
                    is_verified: "$is_verified",
                    user_type: "$user_type",
                    latLong: "$latLong",
                    picture: "$picture",
                    name: "$shopinfo.name",
                    location: "$shopinfo.state",
                    shopinfo: "$shopinfo"
                }
            }, {
                $match: query
            }, {
                "$skip": skipNo
            }, {
                "$limit": count
            }]).exec(function(err, result) {
                var length = result.length;
                if (err) {
                    res.status(400).send({
                        "msg": constantObj.messages.userStatusUpdateFailure,
                        "err": err
                    });
                } else {
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

exports.shopdetail = function(req, res) {
    req.checkParams("user_id", "user_id cannot be blank").notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    var query = {};
    query._id = mongoose.Types.ObjectId(req.params.user_id);
    console.log(req.params.user_id)
    user.aggregate([{
        $match: query
    }, {
        $lookup: {
            from: "shops",
            localField: "_id",
            foreignField: "user_id",
            as: "shopinfo"
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
            is_deleted: "$is_deleted",
            is_active: "$is_active",
            is_verified: "$is_verified",
            user_type: "$user_type",
            latLong: "$latLong",
            picture: "$picture",
            shopinfo: "$shopinfo",
            gallery:"$gallery"
        }
    }]).exec(function(err, result) {
        if (err) {
            res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure,
                "err": err
            });
        } else {
            console.log(result)
            res.status(200).send({
                "msg": constantObj.messages.successRetreivingData,
                "data": result
            })
        }
    })
};

exports.chairdetail = function(req, res) {
    req.checkParams("chair_id", "chair_id cannot be blank").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    var query = mongoose.Types.ObjectId(req.params.chair_id);
    shop.find({
        "chairs._id": query
    }, {
        "chairs.$": 1
    }, function(err, result) {
        if (err) {
            res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure,
                "err": err
            });
        } else {
            if (result) {
                console.log("result", result)
                res.status(200).send({
                    "msg": constantObj.messages.successRetreivingData,
                    "data": result
                })
            }
        }
    })
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

        console.log("req.params.shop_id", req.params.shop_id);
        console.log("req.params.barber_id", req.params.barber_id);


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
                },
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

exports.shopContainsChairs = function(req, res) {
    req.checkHeaders('user_id', 'Shop user id is required.').notEmpty();
    let shop_user_id = mongoose.Types.ObjectId(req.headers.user_id);
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    shop.findOne({
        user_id: shop_user_id
    }, function (err, shopData) {


        shop.aggregate([
            {
                $match: {
                    user_id: shop_user_id
                }
            },
            {
                $unwind: "$chairs"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "chairs.barber_id",
                    foreignField: "_id",
                    as: "barberInformation"
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    license_number: 1,
                    ratings: 1,
                    latLong: 1,
                    state: 1,
                    city: 1,
                    zip: 1,
                    address: 1,
                    name: 1,
                    chairs: 1,
                    chairs: {
                        isActive: 1,
                        _id: 1,
                        availability: 1,
                        name: 1,
                        shop_percentage: 1,
                        type: 1,
                        barber_percentage: 1,
                        booking_start: 1,
                        booking_end: 1,
                        amount: 1,
                        barber_id: 1,
                        barber: "$barberInformation"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    chairs: {$push: "$chairs"},
                    name: {$first: "$name"},
                    license_number: {$first: "$license_number"},
                    ratings: {$first: "$ratings"},
                    latLong: {$first: "$latLong"},
                    state: {$first: "$state"},
                    city: {$first: "$city"},
                    zip: {$first: "$zip"},
                    address: {$first: "$address"}

                }
            }]).exec(function (err, result) {
            console.log(result);
            if (err) {
                return res.status(400).send({
                    msg: "error in your request",
                    err: errors
                });
            } else {

                res.status(200).send({
                    msg: constantObj.messages.successRetreivingData,
                    data: result,
                    shop_id:shopData._id
                })
            }
        })
    })
}

exports.shopAcceptChairRequest = function(req, res) {
    req.checkHeaders('user_id', 'User id is required.').notEmpty();
    req.assert('chair_id', 'Chair id is required.').notEmpty();
    req.assert('shop_id', 'Shop id is required.').notEmpty();
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
                "msg": constantObj.messages.successRetreivingData,
            });
        }
    })
}

exports.markChairAsBooked = function(req, res) {
    req.checkHeaders('user_id', 'User id is required.').notEmpty();
    req.checkParams('chair_id', 'Chair id is required.').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let updateCollectionData = {
        $unset: {
            "chairs.$.shop_percentage": "",
            "chairs.$.barber_percentage": "",
            "chairs.$.amount": ""
        },
        $set: {
            "chairs.$.type": 'self',
            "chairs.$.availability": 'booked'
        }
    };
    shop.update({
        "user_id": req.headers.user_id,
        "chairs._id": req.params.chair_id
    }, updateCollectionData, function(err, result) {
        if (err) {
            return res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure
            })
        } else {
            res.status(200).send({
                "msg": constantObj.messages.userStatusUpdateSuccess
            });
        }
    })
}

exports.manageChair = function(req, res) {
    req.checkHeaders('user_id', 'User id is required.').notEmpty();
    req.assert('chair_id', 'Chair id is required.').notEmpty();
    req.assert('type', 'Chair type is required').notEmpty();
     console.log("rahulgajkbkjl", req.body);
    if (req.body.type == 'weekly' || req.body.type == 'monthly') {
        req.assert('amount', 'Amount is required.').notEmpty();
    } else {
        req.assert('shop_percentage', 'Shop percentage is required.').notEmpty();
        req.assert('barber_percentage', 'Barber percentage is required.').notEmpty();
    }
    if (req.validationErrors()) {
        return res.status(400).send({
            msg: "error in your request",
            err: req.validationErrors()
        });
    }

        console.log("rahull", req.body);
    if (req.body.type == 'percentage') {
        var updateCollectionData = {
            $unset: {
                "chairs.$.amount": ""
            },
            $set: {
                "chairs.$.shop_percentage": parseInt(req.body.shop_percentage),
                "chairs.$.type": req.body.type,
                "chairs.$.barber_percentage": parseInt(req.body.barber_percentage)
            }
        };
    } else {
        var updateCollectionData = {
            $unset: {
                "chairs.$.shop_percentage": "",
                "chairs.$.barber_percentage": ""
            },
            $set: {
                "chairs.$.type": req.body.type,
                "chairs.$.amount": req.body.amount
            }
        };
    }
    console.log("updateCollectionData", updateCollectionData);
    shop.update({
        "user_id": req.headers.user_id,
        "chairs._id": req.body.chair_id
    }, updateCollectionData, function(err, result) {
        if (err) {
            return res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure
            })
        } else {
            res.status(200).send({
                "msg": constantObj.messages.userStatusUpdateSuccess
            });
        }
    })
}

exports.countshop = function(req, res) {
    user.find({
        user_type: "shop"
    }, function(err, barber) {
        res.json(barber);
    });
};

exports.deactiveshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    user.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_active: false
        }
    }, function(err, count) {
        user.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.activateshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    user.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_active: true
        }
    }, function(err, count) {
        user.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.disapproveshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    user.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_verified: false
        }
    }, function(err, count) {
        user.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.verifyshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    user.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_verified: true
        }
    }, function(err, count) {
        user.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.deleteshop = function(req, res) {
    user.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_deleted: true
        }
    }, function(err, count) {
        user.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.undeleteshop = function(req, res) {
    user.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_deleted: false
        }
    }, function(err, count) {
        user.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};
