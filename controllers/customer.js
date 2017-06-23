var User = require('../models/User');
var shop = require('../models/shop');
let mongoose = require('mongoose');
let constantObj = require('./../constants.js');
var appointment = require('../models/appointment');
let moment = require('moment');


exports.listcustomers = function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var count = parseInt(req.query.count) || 10;
    var skipNo = (page - 1) * count;
    console.log("skip",page)
    var query = {};
    query.user_type = "customer"
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
            mobile_number: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }
    
    User.aggregate([{
        $match: query
    },{
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
            gallery: "$gallery",
            latLong: "$latLong",
            picture: "$picture"
        }
    }]).exec(function(err, data) {
        if (err) {
            console.log(err)
        } else {
            
            var length = data.length;
            User.aggregate([{
                $match: query
            }, {
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
            gallery: "$gallery",
            latLong: "$latLong",
             picture: "$picture"
        }

            }, {
                "$skip": skipNo
            }, {
                "$limit": count
            }]).exec(function(err, result) {
                if(err){
                        res.status(400).send({
                        "msg": constantObj.messages.errorRetreivingData,
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


exports.customerappointments = function(req, res) {
    req.checkParams("cust_id", "cust_id cannot be blank").notEmpty();
    console.log("req.params.cust_id",req.params.cust_id)
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    let currentDate = moment().format("YYYY-MM-DD");
    // below query will give us all those appointments who are pending and rescheduled
    appointment.find({
            "customer_id": {
                $exists: true,
                $eq: req.params.cust_id
            },
            "appointment_status": {
                $in: ['pending', 'reschedule', 'confirm']
            },
            "appointment_date": {
                $gte: currentDate
            }
        }).populate('barber_id', 'first_name last_name ratings picture created_date')
        .populate('customer_id', 'first_name last_name ratings picture created_date email mobile_number latLong isActive is_verified isDeleted ratings')
        .populate('shop_id', 'name address city state gallery latLong created_date user_id')
        .exec(function(err, result) {
            if (err) {
                return res.status(400).send({
                    msg: constantObj.messages.errorRetreivingData
                });
            } else {
                // This will give all appointments who are completed
                console.log("res",result);
                appointment.find({
                        "customer_id": {
                            $exists: true,
                            $eq: req.params.cust_id
                        },
                        "appointment_status": {
                            $in: ['completed']
                        }
                    }).populate('barber_id', 'first_name last_name ratings picture created_date')
                    .populate('customer_id', 'first_name last_name ratings picture created_date email mobile_number latLong isActive is_verified isDeleted ratings')
                    .populate('shop_id', 'name address city state gallery latLong created_date user_id')
                    .exec(function(err, data) {

                        if (err) {
                            return res.status(400).send({
                                msg: constantObj.messages.errorRetreivingData
                            });
                        } else {
                            console.log("result",data)
                            return res.status(200).send({
                                msg: constantObj.messages.successRetreivingData,
                                data: {
                                    upcoming: result,
                                    complete: data
                                }
                            });
                        }
                    })
            }
        })
};


exports.custdetail = function(req, res) {
    req.checkParams("cust_id", "cust_id cannot be blank").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    var query = {};
    query._id = mongoose.Types.ObjectId(req.params.cust_id);
    console.log("custdet",query._id)
    query.user_type = "customer";
            User.aggregate([{
                $match: query
            }, {
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
            gallery: "$gallery",
            latLong: "$latLong",
             picture: "$picture"
        }

            }]).exec(function(err, result) {
                if(err){
                        res.status(400).send({
                        "msg": constantObj.messages.errorRetreivingData,
                        "err": err
                    });
                }else{
                    res.status(200).send({
                        "msg": constantObj.messages.successRetreivingData,
                        "data": result
                    })
                }
            })
};



exports.countcustomer = function(req, res) {
    User.find({
        user_type: "customer"
    }, function(err, barber) {
        res.json(barber);
    });
};


exports.deletecustomer = function(req, res) {
    console.log(req.params.cust_id);
    User.update({
        _id: req.params.cust_id
    }, {
        $set: {
            isDeleted: true
        }
    }, function(err, count) {
        User.find({
            user_type: "customer"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};


exports.undeletecustomer = function(req, res) {
    console.log("undel",req.params.cust_id);
    User.update({
        _id: req.params.cust_id
    }, {
        $set: {
            isDeleted: false
        }
    }, function(err, count) {
        User.find({
            user_type: "customer"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.deactivecustomer = function(req, res) {
    console.log("custid", req.params.cust_id);
    User.update({
        _id: req.params.cust_id
    }, {
        $set: {
            isActive: false
        }
    }, function(err, count) {
        User.find({
            user_type: "customer"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.activatecustomer = function(req, res) {
    console.log("custid", req.params.cust_id);
    User.update({
        _id: req.params.cust_id
    }, {
        $set: {
            isActive: true
        }
    }, function(err, count) {
        User.find({
            user_type: "customer"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.disapprovecustomer = function(req, res) {
    console.log("custid", req.params.cust_id);
    User.update({
        _id: req.params.cust_id
    }, {
        $set: {
            is_verified: false
        }
    }, function(err, count) {
        User.find({
            user_type: "customer"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.verifycustomer = function(req, res) {
    console.log("custid", req.params.cust_id);
    User.update({
        _id: req.params.cust_id
    }, {
        $set: {
            is_verified: true
        }
    }, function(err, count) {
        User.find({
            user_type: "customer"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};







