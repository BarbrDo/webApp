let shop = require('../models/shop');
let constantObj = require('./../constants.js');

exports.editShop = function(req, res) {
    let updateData = JSON.parse(JSON.stringify(req.body));
    updateData.modified_date = new Date();
    delete updateData._id;
    if ((req.files) && (req.files.length > 0)) {
        let userimg = [];
        for (let i = 0; i < req.files.length; i++) {
            if (req.files[i].fieldname == 'image') {
                updateData.image = req.files[i].filename;
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
    shop.update({
        _id: req.body._id
    }, updateData, function(err, data) {
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
                        first_name: result.chairs[i].barber_id.first_name,
                        last_name: result.chairs[i].barber_id.last_name,
                        _id: result.chairs[i].barber_id._id,
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
                    barber: resultTantArray
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
        if(req.query.search){
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
        },{
            $match:{"name":{$regex:search, $options: 'i'}}
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

exports.allBarbers = function(req, res) {
    if (req.headers.device_latitude && req.headers.device_longitude) {
        let long = parseFloat(req.headers.device_longitude);
        let lati = parseFloat(req.headers.device_latitude);
        let maxDistanceToFind = constantObj.distance.shopDistance; // in miles in km 0.001
        let search = ""
        if(req.query.search){
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
        },{
            $match:{$or:[
                {"barberInformation.first_name":{$regex:search, $options: 'i'}},
                {"barberInformation.last_name":{$regex:search, $options: 'i'}}
            ]
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
        if(req.query.search){
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
        },{
            $match:{"name":{$regex:search, $options: 'i'}}
        }]).exec(function(err,result){
             if (err) {
                console.log(err);
            } else {
               res.status(200).send({
                    "msg": constantObj.messages.successRetreivingData,
                    "data": result
                })
            }
        })
        // shop.geoNear(point, {
        //     maxDistance: maxDistanceToFind,
        //     spherical: true,
        //     query: { "chairs.availability": "booked" }
        // },function(err, data) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //        res.status(200).send({
        //             "msg": constantObj.messages.successRetreivingData,
        //             "data": data
        //         })
        //     }
        // })
    } else {
        res.status(400).send({
            "msg": constantObj.messages.requiredFields
        })
    }
}