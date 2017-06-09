var User = require('../models/User');
var shop = require('../models/shop');
// var constantObj = require('./../constants.js');
let constantObj = require('./../constants.js');

exports.listcustomers = function(req, res) {
    console.log("page",req.body.page);
    console.log("count",req.body.count);
    var page = req.body.page || 1,
        count = req.body.count || 10;
    var skipNo = (page - 1) * count;
    var query = {};
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
                        'message': 'data retrieve from customer',
                        'data': result,
                        'count': length
                    }
                }
                res.status(200).jsonp(outputJSON);
            })
        }
    })
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

exports.deactiveshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    User.update({
        _id: req.params.shop_id
    }, {
        $set: {
            isActive: false
        }
    }, function(err, count) {
        User.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.activateshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    User.update({
        _id: req.params.shop_id
    }, {
        $set: {
            isActive: true
        }
    }, function(err, count) {
        User.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.disapproveshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    User.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_verified: false
        }
    }, function(err, count) {
        User.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.verifyshop = function(req, res) {
    console.log("shopid", req.params.shop_id);
    User.update({
        _id: req.params.shop_id
    }, {
        $set: {
            is_verified: true
        }
    }, function(err, count) {
        User.find({
            user_type: "shop"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.deactivebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    User.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isActive: false
        }
    }, function(err, count) {
        User.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};


exports.activatebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    User.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isActive: true
        }
    }, function(err, count) {
        User.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.verifybarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    User.update({
        _id: req.params.barber_id
    }, {
        $set: {
            is_verified: true
        }
    }, function(err, count) {
        User.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.disapprovebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    User.update({
        _id: req.params.barber_id
    }, {
        $set: {
            is_verified: false
        }
    }, function(err, count) {
        User.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};


exports.deletebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    User.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isDeleted: false
        }
    }, function(err, count) {
        User.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};

exports.undeletebarber = function(req, res) {
    console.log("barber_id", req.params.barber_id);
    User.update({
        _id: req.params.barber_id
    }, {
        $set: {
            isDeleted: true
        }
    }, function(err, count) {
        User.find({
            user_type: "barber"
        }, function(err, shopss) {
            res.json(shopss);
        });
    });

};




