var User = require('../models/User');
var shop = require('../models/shop');
// var constantObj = require('./../constants.js');
let constantObj = require('./../constants.js');

exports.listcustomers = function(req, res) {
    var page = req.body.page || 1,
        count = req.body.count || 10;
    var skipNo = (page - 1) * count;
    var query = {};
    query.isDeleted = false,
        query.user_type = "customer"
    var searchStr = req.body.search;


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
            mobile_number: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }

    User.aggregate([{
        $project: {
            _id: "$_id",
            first_name: "$first_name",
            last_name: "$last_name",
            email: "$email",
            mobile_number: "$mobile_number",
            isDeleted: "$isDeleted",
            user_type: "$user_type"
        }
    }, {
        $match: query
    }]).exec(function(err, data) {
        if (err) {
            console.log(err)
        } else {
            var length = data.length;
            User.aggregate([{
                $project: {
                    _id: "$_id",
                    first_name: "$first_name",
                    last_name: "$last_name",
                    email: "$email",
                    mobile_number: "$mobile_number",
                    isDeleted: "$isDeleted",
                    user_type: "$user_type",
                    isActive: "$isActive"
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
                        'message': 'data retrieve from products',
                        'data': result,
                        'count': length
                    }
                }
                res.status(200).jsonp(outputJSON);
            })
        }
    })
};

exports.updatecustomer = function(req, res) {
    User.findById(req.params.id, function(err, customer) {
        customer = new User(req.body);
        customer.update(req.body, function(err, count) {
            User.find({
                user_type: "customer",
                isDeleted: "false"
            }, function(err, customers) {
                res.json(customers);
            });
        });
    });
};
exports.updatebarber = function(req, res) {
    User.findById(req.params.id, function(err, barber) {
        barber = new User(req.body);
        barber.update(req.body, function(err, count) {
            console.log("count", count);
            User.find({
                user_type: "barber",
                isDeleted: "false"
            }, function(err, barbers) {
                res.json(barbers);
            });
        });
    });
};


exports.countbarber = function(req, res) {
    User.find({
        user_type: "barber"
    }, function(err, barber) {
        res.json(barber);
    });
};

exports.countshop = function(req, res) {
    User.find({
        user_type: "shop"
    }, function(err, barber) {
        res.json(barber);
    });
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
            isDeleted: false,
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



exports.deletebarber = function(req, res) {
    console.log(req.params.barber_id);
    User.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isDeleted: true
        }
    }, function(err, count) {
        console.log("count", count);
        User.aggregate([{
            "$match": {
                "user_type": "barber",
                "isDeleted": false
            }
        }, {
            $lookup: {
                from: "shops",
                "localField": "_id",
                "foreignField": "chairs.barber_id",
                "as": "shopdetails"
            }
        }]).exec(function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.send(data);
            }
        });
    });

};


exports.addbarber = function(req, res) {
    User({
        first_name: req.body.first_name,
        user_type: "barber"
    }).save(function(err, barber) {
        res.json(barber);
        console.log("barber", barber);
    });
};