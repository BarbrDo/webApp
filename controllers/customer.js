var User = require('../models/User');
var shop = require('../models/shop');
let mongoose = require('mongoose');
let constantObj = require('./../constants.js');
var appointment = require('../models/appointment');
let moment = require('moment');
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');


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
            is_deleted: "$is_deleted",
            is_active: "$is_active",
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
            is_deleted: "$is_deleted",
            is_active: "$is_active",
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
        .populate('customer_id', 'first_name last_name ratings picture created_date email mobile_number latLong is_active is_verified is_deleted ratings')
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
                    .populate('customer_id', 'first_name last_name ratings picture created_date email mobile_number latLong is_active is_verified is_deleted ratings')
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
            is_deleted: "$is_deleted",
            is_active: "$is_active",
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
            is_deleted: true
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
            is_deleted: false
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
            is_active: false
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
            is_active: true
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

exports.login = function (req,res) {
    console.log(req.body);
 if(req.body.username === process.env.ADMIN_USERNAME && req.body.password ===process.env.ADMIN_PASSWORD){
    res.status(200).send({
        "msg":"You have successfully login."
    })
 }  
 else{
    res.status(400).send({
        "msg":"You are not authorized."
    })
 } 
}
exports.contactBarber = function (req, res) {
    req.checkHeaders("user_id", "user_id is required").notEmpty();
    req.assert("minutes", "Time is required.").notEmpty();
    req.assert("appointment_id", "Appointment _id is required.").notEmpty();
    req.assert("appointment_date", "appointment_date is required").notEmpty();
    req.assert('barber_id', 'Barber id cannot be blank').notEmpty();
  req.assert('name', 'Barber name cannot be blank').notEmpty();
  req.assert('email', 'Email cannot be blank').notEmpty();

  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
 let auth = {
    auth: {
      api_key: process.env.MAILGUN_APIKEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }
  let nodemailerMailgun = nodemailer.createTransport(mg(auth));

  var mailOptions = {
    from: req.body.name + ' ' + '<' + req.body.email + '>',
    to: 'hshussain86@gmail.com',
    subject: '✔ Contact Barber to Reschedule',
    text: "Please reschedule the appointment by " + ' ' +  req.body.minutes + ' ' + 'minutes' 
  };

  nodemailerMailgun.sendMail(mailOptions, function(err) {
    res.status(200).send({
      "msg": constantObj.messages.emailsend
    });
  });
}
