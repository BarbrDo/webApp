let user = require('../models/User');
let shopBarber = require('../models/shop_barber');
let service = require('../models/service');
let constantObj = require('./../constants.js');
let async = require('async');
let notification = require('../models/notification');
let appointment = require('../models/appointment');
let commonObj = require('../common/common');
let shop = require('../models/shop');
let mongoose = require('mongoose');
let moment = require('moment');
let usStates = require('../models/us_states');
let referal = require('../models/referral');
/*
_________________________________________________________
Author:Hussain,
Created:10 aug 2017
Required fields:services to b added, and user_id, 
Description:Add Barber Services
_________________________________________________________
 */
exports.addBarberServices = function(req, res) {
  req.checkHeaders('user_id', 'User id cannot be blank.').notEmpty();
  req.assert("services", 'services cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let myArray = [];
  let len = req.body.services.length;
  console.log("len is ", len);
  async.waterfall([
    function(done) {
      callFunction(len)

      function callFunction(len) {
        if (len < 1) {
          console.log("less then one");
          done(null, "done");
          return 1;
        } else {
          console.log("len in else");
          service.findOne({
            _id: req.body.services[len - 1]._id
          }, function(err, result) {
            console.log(len);
            console.log(result);
            if (result) {
              myArray.push({
                service_id: req.body.services[len - 1]._id,
                name: result.name,
                price: req.body.services[len - 1].price
              })
              return callFunction(len - 1);
            }
          })
        }
      }
    },
    function(token, done) {
      console.log(myArray);
      user.update({
        _id: req.headers.user_id
      }, {
        $push: {
          barber_services: {
            $each: myArray
          }
        }
      }).exec(function(err, data) {
        if (err) {
          return res.send(400, {
            "msg": "Error in saving services"
          });
        } else {
          res.status(200).send({
            "msg": "Servies saved."
          });
        }
      })
    }
  ])
}

/*
_________________________________________________________
Author:Hussain,
Created:10 aug 2017
Required fields:appointment_id,user_type,user_id, 
Description:Barber cancel appointment
_________________________________________________________
 */

exports.cancelAppointment = function(req, res) {
  req.checkParams("appointment_id", "Appointment id is required.").notEmpty();
  req.checkHeaders("user_type", "User type is required.").notEmpty();
  req.checkHeaders("user_id", "User Id cannot be blank").notEmpty();
  req.assert("request_cancel_on","Request cancel Date is required.").notEmpty();
  // req.assert("cancel_reason","Cancel appointment reason is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  var id = mongoose.Types.ObjectId(req.params.appointment_id);
  let updateData = {
    $set: {
      "cancel_by_user_type": req.headers.user_type,
      "cancel_by_user_id": req.headers.user_id,
      "appointment_status": "cancel",
      "request_cancel_on":req.body.request_cancel_on
    }
  }
  if (req.body.cancel_reason) {
    updateData.cancel_reason = req.body.cancel_reason
  }
  user.update({
    _id: req.headers.user_id
  }, {
    $set: {
      is_available: true
    }
  }, function(err, data) {
    console.log("user udpate cancel appointment", data);
  })
  appointment.findOne({
    _id: id
  }, function(err, result) {
    if (err) {
      return res.status(400).send({
        msg: "error in finding appointment.",
        err: errors
      });
    } else {
      console.log("result in appointment", result);
      if (result) {
        let data = ""
        callNotification("barber_cancel_appointment", result.customer_id, result.barber_id, data);
        appointment.update({
          _id: id
        }, updateData, function(err, result) {
          console.log("cancel by barber appointment", err, result);
          if (err) {
            res.status(400).send({
              msg: constantObj.messages.errorRetreivingData,
              "err": err
            });
          } else {
            res.status(200).send({
              msg: 'Declined successfully.',
              data: result
            });
          }
        })
      } else {
        res.status(400).send({
          msg: "No record found"
        });
      }
    }
  })
};

/*
_________________________________________________________
Author:Hussain,
Created:10 aug 2017
Required fields:customer_id,user_id,text , 
Description:Notification based messages will be sent to customer
_________________________________________________________
 */

exports.sendMessageToCustomer = function(req, res) {
  req.assert("customer_id", "customer id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("text", "Text is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  user.findOne({
    _id: req.headers.user_id
  }, {
    _id: 1,
    first_name: 1,
    last_name: 1,
    email: 1,
    picture: 1
  }, function(err, data) {
    if (data) {
      let obj = {
        text: req.body.text,
        customerInfo: data
      }
      commonObj.notify(req.body.customer_id, req.headers.user_id, "sent you a message", "message_to_customer", obj, function(err, data) {
        if (err) {
          console.log(err);
        } else {

        }
      })
    }
  })
  res.status(200).send({
    msg: "Your message has been successfully sent."
  });
}

/*
_________________________________________________________
Author:Hussain,
Created:10 aug 2017
Required fields:user_id,appointment_id,and action . Action must be confirm, 
Description:Barber confirm appointment
_________________________________________________________
 */

exports.confirmRequest = function(req, res) {
  //Mark Appointment as confirmed
  req.checkHeaders("user_id", "user_id is required.").notEmpty();
  req.checkParams("appointment_id", "Appointment _id is required.").notEmpty();
  req.assert("appointment_date", "appointment_date is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  date = removeOffset(req.body.appointment_date)
  appointment.update({
    _id: req.params.appointment_id
  }, {
    $set: {
      "appointment_status": "confirm",
      "appointment_date": date
    }
  }, function(err, result) {
    if (err) {
      return res.status(400).send({
        msg: constantObj.messages.userStatusUpdateFailure
      });
    } else {
      user.update({
        _id: req.headers.user_id
      }, {
        $set: {
          'is_available': false
        }
      }, function(err, result) {
        console.log("barber unavailable", result);
      })
      appointment.findOne({
        _id: req.params.appointment_id
      }, function(err, result) {
        if (result) {
          user.findOne({
            _id: req.headers.user_id
          }, {
            _id: 1,
            first_name: 1,
            last_name: 1,
            email: 1,
            user_type: 1,
            barber_services: 1,
            picture: 1
          }, function(err, userData) {
            if (userData) {
              user.aggregate([{
                $match: {
                  "_id": mongoose.Types.ObjectId(req.headers.user_id)
                }
              }, {
                $unwind: "$ratings"
              }, {
                $group: {
                  _id: '$_id',
                  sum: {
                    $sum: '$ratings.score'
                  },
                  count: {
                    $sum: 1
                  }
                }
              }]).exec(function(err, data) {
                if (err) {
                  res.status(200).send({
                    msg: "In error"
                  })
                } else {
                  let passObj = {};
                  console.log("data of rating", data);
                  passObj.barberInfo = JSON.parse(JSON.stringify(userData))
                  if (data.length > 0) {
                    passObj.barberInfo.rating_score = data[0].sum / data[0].count;
                    passObj.appointmentInfo = result
                    console.log("passObj", JSON.stringify(passObj));
                    callNotification("barber_confirm_appointment", result.customer_id, result.barber_id, passObj);
                  } else {
                    passObj.barberInfo.rating_score = 0;
                    passObj.appointmentInfo = result
                    console.log("passObj", JSON.stringify(passObj));
                    callNotification("barber_confirm_appointment", result.customer_id, result.barber_id, passObj);
                  }
                }
              })
            }
          })
        }
      })
      return res.status(200).send({
        msg: "Accepted successfully."
      });
    }
  })
}

let removeOffset = function(dobFormat) {
    let userOffset = new Date(dobFormat).getTimezoneOffset();
    let userOffsetMilli = userOffset * 60 * 1000;
    let dateInMilli = moment(dobFormat).unix() * 1000;
    let dateInUtc = dateInMilli - userOffsetMilli;
    return dateInUtc;
  }
  /*
  _________________________________________________________
  Author:Hussain,
  Created:10 aug 2017
  Required fields:user_id,status.Status must b online and offline, 
  Description:Barber chagne status to online and offline 
  _________________________________________________________
   */


exports.viewBarberProfile = function(req, res) {
  console.log("view barber profile");
  req.checkParams("barber_id", "barber ID is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  var id = mongoose.Types.ObjectId(req.params.barber_id);
  user.findOne({
    _id: id
  }).exec(function(err, data) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        err: err
      });
    } else {
      appointment.find({
        barber_id: req.params.barber_id,
        "appointment_status": ""
      }, function(appErr, appData) {
        res.status(200).send({
          msg: constantObj.messages.successRetreivingData,
          "data": data,
          "no_of_cuts": appData.length
        });
      })
    }
  })
}

let callNotification = function(type, to_user_id, from_user_id, data) {
  console.log("callNotification");
  notification.findOne({
    "type": type
  }, function(err, result) {
    console.log("result in notification_____________", result);
    if (result) {
      console.log("data in notification_____________", data);
      console.log(to_user_id, from_user_id, result.text, type, data);
      // passing arguments like to_user_id,from_user_id, and text
      commonObj.notify(to_user_id, from_user_id, result.text, type, data, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          // var updateUser = {
          //   key: "customer_create_appointment",
          //   text: name + " " + result.text
          // };
          // console.log(updateUser);
          // user.update({
          //   _id: user_id
          // }, {
          //   $push: {
          //     notification: updateUser
          //   }
          // }).exec(function(err, data) {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     console.log(data);
          //   }
          // })
        }
      })
    }
  })
}

exports.getAllServices = function(req, res) {
  service.find({
    "status": true
  }, function(err, data) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        err: err
      })
    } else {
      res.status(200).send({
        msg: constantObj.messages.successRetreivingData,
        "data": data
      })
    }
  })
}

exports.addBarberServices = function(req, res) {
  req.checkHeaders("user_id", "user_id is required").notEmpty();
  req.assert("service_id", "service_id is required.").notEmpty();
  req.assert("name", "name is required").notEmpty();
  req.assert("price", "price is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let updateData = {
    service_id: req.body.service_id,
    name: req.body.name,
    price: req.body.price
  }
  user.update({
    _id: req.headers.user_id
  }, {
    $push: {
      barber_services: updateData
    }
  }).exec(function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorInSave,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: constantObj.messages.saveSuccessfully,
        "data": result
      });
    }
  })
}

exports.editBarberServices = function(req, res) {
  console.log(req.body);
  req.checkHeaders("user_id", "User Id is required").notEmpty();
  req.checkParams("barber_service_id", "Barber Service Id is required").notEmpty();
  req.assert("price", "Service Price is required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({
      msg: "error in request",
      err: req.validationErrors()
    })
  }
  barber_service.update({
    service_id: req.params.barber_service_id
  }, {
    $set: {
      "price": req.body.price
    }
  }, function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.userStatusUpdateFailure
      })
    } else {
      res.status(200).send({
        msg: constantObj.messages.userStatusUpdateSuccess
      })
    }
  })
}

exports.deleteBarberService = function(req, res) {
  req.checkHeaders("user_id", "User Id is required").notEmpty();
  req.checkParams("barber_service_id", "Barber Service Id is required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({
      msg: "error in request",
      err: req.validationErrors()
    })
  }

  barber_service.update({
    _id: req.params.barber_service_id
  }, {
    $set: {
      "is_deleted": true
    }
  }, function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.userStatusUpdateFailure
      })
    } else {
      res.status(200).send({
        msg: constantObj.messages.userDeleteSuccess
      })
    }
  })
}

exports.viewAllServiesOfBarber = function(req, res) {
  req.checkParams("user_id", "user_id is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log("database", req.params.barber_id)
  user.findOne({
    "_id": req.headers.barber_id
  }, function(err, data) {
    console.log()
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        err: err
      });
    } else {
      res.status(200).send({
        msg: constantObj.messages.successRetreivingData,
        "data": data
      });
    }
  })
}
exports.countbarber = function(req, res) {
  user.find({
    user_type: "barber",
    "is_deleted" : false,
    "is_active" : true
  }, function(err, barber) {
    user.find({
      user_type: "barber",
      "is_online": true
    }, function(activeErr, activeBar) {
      user.find({
        user_type: "barber",
        "is_online": false
      }, function(inActiveErr, inActiveData) {
        res.json({
          total: barber.length,
          online: activeBar.length,
          offline: inActiveData.length
        });
      })
    })
  });
};
exports.deletebarber = function(req, res) {
  console.log("barber_id", req.params.barber_id);
  user.update({
    _id: req.params.barber_id
  }, {
    $set: {
      is_deleted: true
    }
  }, function(err, count) {
    user.find({
      user_type: "barber"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });

};

exports.undeletebarber = function(req, res) {
  console.log("barber_id", req.params.barber_id);
  user.update({
    _id: req.params.barber_id
  }, {
    $set: {
      is_deleted: false
    }
  }, function(err, count) {
    user.find({
      user_type: "barber"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });

};
exports.activatebarber = function(req, res) {
  console.log("barber_id", req.params.barber_id);
  user.update({
    _id: req.params.barber_id
  }, {
    $set: {
      is_active: true
    }
  }, function(err, count) {
    user.find({
      user_type: "barber"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });
};
exports.deactivebarber = function(req, res) {
  console.log("barber_id", req.params.barber_id);
  user.update({
    _id: req.params.barber_id
  }, {
    $set: {
      is_active: false
    }
  }, function(err, count) {
    user.find({
      user_type: "barber"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });
};
exports.disapprovebarber = function(req, res) {
  console.log("barber_id", req.params.barber_id);
  user.update({
    _id: req.params.barber_id
  }, {
    $set: {
      is_verified: false
    }
  }, function(err, count) {
    user.find({
      user_type: "barber"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });
};
exports.verifybarber = function(req, res) {
  console.log("barber_id", req.params.barber_id);
  user.update({
    _id: req.params.barber_id
  }, {
    $set: {
      is_verified: true
    }
  }, function(err, count) {
    user.find({
      user_type: "barber"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });
};
exports.barberdetail = function(req, res) {
  req.checkParams("barber_id", "barber_id cannot be blank").notEmpty();
  var query = {};
  let id = mongoose.Types.ObjectId(req.params.barber_id);
  query._id = id
  user.aggregate([{
    $match: {
      "_id": id
    }
  }, {
    $unwind: "$subscription"
  }, {
    $sort: {
      "subscription.created_date": -1
    }
  }, {
    $project: {
      _id: "$_id",
      first_name: "$first_name",
      last_name: "$last_name",
      email: "$email",
      mobile_number: "$mobile_number",
      created_date: "$created_date",
      is_deleted: "$is_deleted",
      bio: "$bio",
      license_number: "$license_number",
      licensed_since:"$licensed_since",
      is_active: "$is_active",
      is_online: "$is_online",
      is_available: "$is_available",
      is_verified: "$is_verified",
      user_type: "$user_type",
      latLong: "$latLong",
      picture: "$picture",
      name: "$shopdetails.name",
      shop: "$shopdetails",
      gallery: "$gallery",
      subscription: "$subscription",
      subscription_end_date: "$subscription_end_date"
    }
  }]).exec(function(err, result) {
    if (err) {
      res.status(400).send({
        "msg": constantObj.messages.userStatusUpdateFailure,
        "err": err
      });
    } else {
      shopBarber.aggregate([{
        $lookup: {
          from: 'shops',
          localField: 'shop_id',
          foreignField: '_id',
          as: 'shopInfo'
        }
      }, {
        $match: {
          barber_id: id
        }
      }]).exec(function(err, data) {
        if (err) {
          res.status(400).send({
            "msg": constantObj.messages.userStatusUpdateFailure,
            "err": err
          });
        } else {
          console.log("shop barber data", JSON.stringify(data));
          if (data) {
            for (var i = 0; i < result.length; i++) {
              result[i].associateShops = [];
              for (j = 0; j < data.length; j++) {
                console.log(result[i]._id, data[j].barber_id)
                if (result[i]._id.equals(data[j].barber_id)) {
                  data[j].shopInfo[0].is_default = data[j].is_default;
                  result[i].associateShops.push(data[j].shopInfo[0])
                }
              }
            }
            // res.status(200).send({
            //   "msg": constantObj.messages.successRetreivingData,
            //   "data": result
            // })
            findRatingAndCuts(req, res, result);
          } else {
            // res.status(200).send({
            //   "msg": constantObj.messages.successRetreivingData,
            //   "data": result
            // })
            findRatingAndCuts(req, res, result);
          }
        }
      })
    }
  })
};

let findRatingAndCuts = function(req, res, result) {
  user.aggregate([{
    $match: {
      "_id": mongoose.Types.ObjectId(req.params.barber_id)
    }
  }, {
    $unwind: "$ratings"
  }, {
    $group: {
      _id: '$_id',
      sum: {
        $sum: '$ratings.score'
      },
      count: {
        $sum: 1
      }
    }
  }]).exec(function(err, data) {
    appointment.find({
      barber_id: req.params.barber_id,
      appointment_status: "completed"
    }, function(appErr, appData) {
      if (data.length > 0) {
        res.status(200).send({
          "msg": constantObj.messages.successRetreivingData,
          "data": result,
          "cuts": appData.length,
          "ratings": data[0].sum / data[0].count,
          "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
        })
      } else {
        res.status(200).send({
          "msg": constantObj.messages.successRetreivingData,
          "data": result,
          "cuts": appData.length,
          "ratings": 0,
          "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
        })
      }

    })
  })
}
exports.availableBarbernew = function(req, res) {
  var page = parseInt(req.body.page) || 1;
  var count = parseInt(req.body.count) || 30;
  var skipNo = (page - 1) * count;
  var query = {};
  query.user_type = "barber"
  query.is_deleted = false;
  var searchStr = ""
  if (req.body.search) {
    searchStr = req.body.search;
  }
  var sortkey = null;
  for (key in req.body.sort) {
    sortkey = key;
  }
  var sortquery = {};
  if (sortkey) {
    sortquery[sortkey ? sortkey : '_id'] = req.body.sort ? (req.body.sort[sortkey] == 'desc' ? -1 : 1) : -1;
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
      name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }]
  }
  console.log("sortquery", sortquery, query);
  console.log(query);
  user.aggregate([{
    $project: {
      _id: "$_id",
      first_name: {
        "$toUpper": "$first_name"
      },
      last_name: {
        "$toUpper": "$last_name"
      },
      email: "$email",
      mobile_number: "$mobile_number",
      ratings: "$ratings",
      barber_rating:"$barber_rating",
      barber_numberof_cuts:"$barber_numberof_cuts",
      created_date: "$created_date",
      is_deleted: "$is_deleted",
      is_active: "$is_active",
      is_verified: "$is_verified",
      user_type: "$user_type",
      picture: "$picture"
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
          is_deleted: "$is_deleted",
          is_active: "$is_active",
          is_verified: "$is_verified",
          is_online: "$is_online",
          is_available: "$is_available",
          user_type: "$user_type",
          latLong: "$latLong",
          barber_rating:"$barber_rating",
          barber_numberof_cuts:"$barber_numberof_cuts",
          picture: "$picture",
          name: "$shopdetails.name",
          shop: "$shopdetails"
        }
      }, {
        $match: query
      }, {
        "$sort": sortquery
      }, {
        "$skip": skipNo
      }, {
        "$limit": count
      }]).exec(function(err, result) {
        console.log("result are");
        if (err) {
          res.status(400).send({
            "msg": constantObj.messages.userStatusUpdateFailure,
            "err": err
          });
        } else {
          shopBarber.aggregate([{
            $lookup: {
              from: 'shops',
              localField: 'shop_id',
              foreignField: '_id',
              as: 'shopInfo'
            }
          }]).exec(function(shopBarberErr, shopBarberResult) {
            if (err) {
              res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure,
                "err": shopBarberErr
              });
            } else {
              let arr = [];
              if (shopBarberResult.length > 0) {
                for (var i = 0; i < result.length; i++) {
                  result[i].associateShops = [];
                  for (j = 0; j < shopBarberResult.length; j++) {
                    if (result[i]._id.equals(shopBarberResult[j].barber_id)) {
                      result[i].associateShops.push({
                        name: shopBarberResult[j].shopInfo[0].name
                      })
                    }
                  }
                }
                res.status(200).send({
                  "msg": constantObj.messages.successRetreivingData,
                  "data": result,
                  "count": length
                })
              } else {
                res.status(200).send({
                  "msg": constantObj.messages.successRetreivingData,
                  "data": result,
                  "count": length
                })
              }
            }
          })
        }
      })
    }
  })
};

exports.availableBarber = function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var count = parseInt(req.query.count) || 30;
  var skipNo = (page - 1) * count;
  var query = {};
  query.user_type = "barber"
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
      name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }]
  }
  console.log(query);
  user.aggregate([{
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
      user_type: "$user_type",
      picture: "$picture"
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
          is_deleted: "$is_deleted",
          is_active: "$is_active",
          is_verified: "$is_verified",
          is_online: "$is_online",
          is_available: "$is_available",
          user_type: "$user_type",
          latLong: "$latLong",
          picture: "$picture",
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
          res.status(400).send({
            "msg": constantObj.messages.userStatusUpdateFailure,
            "err": err
          });
        } else {
          shopBarber.aggregate([{
            $lookup: {
              from: 'shops',
              localField: 'shop_id',
              foreignField: '_id',
              as: 'shopInfo'
            }
          }]).exec(function(shopBarberErr, shopBarberResult) {
            if (err) {
              res.status(400).send({
                "msg": constantObj.messages.userStatusUpdateFailure,
                "err": shopBarberErr
              });
            } else {
              let arr = [];
              if (shopBarberResult.length > 0) {
                for (var i = 0; i < result.length; i++) {
                  result[i].associateShops = [];
                  for (j = 0; j < shopBarberResult.length; j++) {
                    if (result[i]._id.equals(shopBarberResult[j].barber_id)) {
                      result[i].associateShops.push({
                        name: shopBarberResult[j].shopInfo[0].name
                      })
                    }
                  }
                }
                res.status(200).send({
                  "msg": constantObj.messages.successRetreivingData,
                  "data": result,
                  "count": length
                })
              } else {
                res.status(200).send({
                  "msg": constantObj.messages.successRetreivingData,
                  "data": result,
                  "count": length
                })
              }
            }
          })
        }
      })
    }
  })
};
exports.rateBarber = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("appointment_id", "Appointment _id is required.").notEmpty();
  req.assert("barber_id", "Barber id is required.").notEmpty();
  req.assert("score", "score is required.").notEmpty();
  req.assert("next_in_chair", "Next in chair is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log(req.body);
  console.log(req.headers);
  let updateData = {
    "$push": {
      "ratings": {
        "rated_by": req.headers.user_id,
        "score": parseInt(req.body.score),
        "appointment_id": req.body.appointment_id,
        "next_in_chair": req.body.next_in_chair
      }
    }
  }
  console.log(updateData);
  async.waterfall([
    function(done) {
      appointment.update({
        _id: req.body.appointment_id
      }, {
        $set: {
          is_rating_given: true,
          rating_score: parseInt(req.body.score)
        }
      }, function(err, result) {
        if (err) {
          done("some error", err)
        } else {
          if (result.nModified == 0) {
            return res.status(400).send({
              msg: "no record found",
              err: err
            });
          } else {
            done(err, result);
          }
        }
      })
    },
    function(status, done) {
      user.update({
        _id: req.body.barber_id
      }, updateData, function(err, result) {
        if (err) {
          return res.status(400).send({
            msg: constantObj.messages.userStatusUpdateFailure,
            err: err
          });
        } else {
          return res.status(200).send({
            msg: constantObj.messages.userStatusUpdateSuccess
          });
          done(err);
        }
      })
    }
  ])
}
exports.goOnline = function(req, res) {
  console.log("goonline", req.headers);
  console.log("body", req.body);
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("services", "service are required.").notEmpty();
  req.assert("shop_id", "shop_id is required.").notEmpty();
  let errors = req.validationErrors();
  console.log("errors", errors);
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log(req.body);
  shop.findOne({
    _id: req.body.shop_id
  }, function(err, shopData) {
    if (shopData) {
      let updateData = {
        $set: {
          is_online: true,
          is_available: true,
          barber_shops_latLong: [
            shopData.latLong[0], shopData.latLong[1]
          ],
          barber_shop_id: req.body.shop_id,
          barber_services: req.body.services
        }
      }
      user.update({
        _id: req.headers.user_id
      }, updateData, function(err, result) {
        if (err) {
          return res.status(400).send({
            msg: "Error in getting online.",
            err: err
          });
        } else {
          return res.status(200).send({
            msg: "You are online now.",
            "data": result
          });
        }
      })
    } else {
      return res.status(400).send({
        msg: "This shop is not present."
      });
    }
  })
};
exports.goOffline = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  console.log("errors", errors);
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  user.findOne({
    _id: req.headers.user_id
  }, function(err, barberResult) {
    if (barberResult) {
      if (barberResult.is_online && barberResult.is_available) {
        user.update({
          _id: req.headers.user_id
        }, {
          $set: {
            is_online: false,
            is_available: false
          }
        }, function(err, result) {
          return res.status(200).send({
            msg: "You are offline now."
          });
        })
      } else {
        return res.status(400).send({
          msg: "You can't go offline now."
        });
      }
    }
  })
};
exports.getShops = function(req, res) {
  let queryArray = [];
  let obj = {};
  console.log(req.query.name);
  console.log(req.query.state);
  console.log(req.query.zip);
  console.log(req.query.city);
  if (req.query.name) {
    obj.name = {
      $regex: req.query.name,
      '$options': 'i'
    }
  }
  if (req.query.state) {
    obj.state = {
      $regex: req.query.state,
      '$options': 'i'
    }
  }
  if (req.query.zip) {
    obj.zip = {
      $regex: req.query.zip,
      '$options': 'i'
    }
  }
  if (req.query.city) {
    obj.city = {
      $regex: req.query.city,
      '$options': 'i'
    }
  }
  console.log(obj);
  shop.find({
    $and: [obj]
  }).exec(function(err, result) {
    if (err) {
      res.status(400).send({
        "msg": constantObj.messages.userStatusUpdateFailure,
        "err": err
      });
    } else {
      res.status(200).send({
        "msg": constantObj.messages.successRetreivingData,
        "data": result
      })
    }
  })
};
exports.addShop = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("shops", "Shops are required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log(req.body);
  for (var i = 0; i < req.body.shops.length; i++) {
    let obj = {
      shop_id: req.body.shops[i].shop_id,
      barber_id: req.headers.user_id
    }
    shopBarber.find(obj, function(shoperr, shopresult) {
      if (shopresult.length > 0) {

      } else {
        shopBarber(obj).save(function(err, result) {
          console.log(err, result);
        })
      }
    })
  }
  res.status(200).send({
    "msg": "Success! Shop added successfully."
  })
};

exports.removeAssociatedShops = function(req, res) {
  console.log(req.body);
  req.checkHeaders("user_id", "User id required.").notEmpty();
  req.assert("shop_id", "shop_id  required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  shopBarber.remove({
    "barber_id": req.headers.user_id,
    shop_id: req.body.shop_id
  }).exec(function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: 'Successfully removed Shop.'
      });
    }
  })
}

exports.makeDefaultshop = function(req, res) {
    req.checkHeaders("user_id", "User id is required.").notEmpty();
    req.assert("shop_id", "Shop_id is required are required.").notEmpty();
    let errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({
        msg: "error in your request",
        err: errors
      });
    }
    let shopId = req.body.shop_id;
    let barberId = req.headers.user_id;
    shopBarber.update({
      barber_id: barberId
    }, {
      $set: {
        is_default: false
      }
    }, {
      multi: true
    }).exec(function(err, multiUpdate) {
      // body...
      shopBarber.update({
        shop_id: shopId,
        barber_id: barberId
      }, {
        $set: {
          is_default: true
        }
      }, function(err, result) {
        if (err) {
          return res.status(400).send({
            msg: "error in making default shop.",
            err: err
          });
        } else {
          console.log(result);
          return res.status(200).send({
            msg: "Shop successfully added.",
            data: result
          });
        }
      })
    })
  }
  /*
  -------------------------------------------------
  This function will return data from shop_barber collection i.e number of shops associated with this barber
  current revenue of this day
  any appointment 
  -------------------------------------------------

   */
exports.barberHomeScreen = function(req, res) {
  console.log("revenue");
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let id = mongoose.Types.ObjectId(req.headers.user_id);
  async.waterfall([
    function(done) {
      shopBarber.aggregate([{
        $lookup: {
          from: 'shops',
          localField: 'shop_id',
          foreignField: '_id',
          as: 'shopInfo'
        }
      }, {
        $match: {
          barber_id: id
        }
      }]).exec(function(err, result) {
        done(null, result)
      })
    },
    function(result, done) {
      console.log("result here", JSON.stringify(result))
      currentRevenue(req, res, function(err, data) {
        if (err) {
          return res.status(400).send({
            msg: "error in your request",
            err: errors
          });
        } else {
          console.log("data in callback", data);
          done(null, result, data)
        }
      })
    },
    function(result, data, done) {
      service.find({
        status: true
      }, function(err, serData) {
        done(null, result, data, serData)
      })
    },
    function(result, data, serData, done) {
      user.findOne({
        _id: req.headers.user_id
      }).populate('barber_shop_id', '_id name').exec(function(err, userResult) {
        done(null, result, data, serData, userResult.is_online, userResult.barber_shop_id)
      })
    },
    function(result, data, serData, online, online_with_shop, done) {
      appointment.aggregate([{
        $match: {
          barber_id: id,
          "appointment_status": "confirm"
        }
      }, {
        $lookup: {
          from: "users",
          "localField": "customer_id",
          "foreignField": "_id",
          "as": "customerInfo"
        }
      }, {
        $sort: {
          created_date: 1
        }
      }]).exec(function(appErr, appData) {
        console.log("appData", appData)
        if (appData.length > 0) {
          res.status(200).send({
            "msg": constantObj.messages.successRetreivingData,
            "associateShops": result,
            "revenue": data,
            "services": serData,
            "is_online": online,
            "online_with_shop": online_with_shop,
            "appointment": appData[0]
          })
        } else {
          res.status(200).send({
            "msg": constantObj.messages.successRetreivingData,
            "associateShops": result,
            "revenue": data,
            "services": serData,
            "online_with_shop": online_with_shop,
            "is_online": online,
            "appointment": {}
          })
        }
      })
    }
  ])
};
let currentRevenue = function(req, res, cb) {
  var currentDate = moment().format("YYYY-MM-DD");

  var startDate = moment(currentDate, "YYYY-MM-DD").format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z';
  var endDate = moment(currentDate, "YYYY-MM-DD").add(1, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z';

  let barber_id = mongoose.Types.ObjectId(req.headers.user_id);

  console.log("currentDate", startDate);
  console.log("endDate", endDate);
  appointment.find({
    barber_id: barber_id,
    created_date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    appointment_status: "completed"
  }).exec(function(err, result) {
    appointment.aggregate([{
      $match: {
        barber_id: barber_id,
        created_date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        appointment_status: "completed"
      }
    }, {
      $group: {
        _id: null,
        totalPrice: {
          $sum: "$totalPrice"
        }
      }
    }]).exec(function(sumErr, sumResult) {
      if (sumErr) {
        cb(sumErr, null)
      } else {
        // console.log("sumResult", sumResult);
        console.log("total cuts", result.length);
        console.log("revenue", sumResult);
        let obj = {
          totalCuts: result.length
        }
        if (sumResult.length > 0) {
          obj.revenue = sumResult[0].totalPrice
        } else {
          obj.revenue = 0
        }
        cb(null, obj)
      }
    })
  })
}

exports.completeAppointment = function(req, res) {
  req.checkParams("appointment_id", "Appointment _id is required.").notEmpty();
  req.checkHeaders("user_id", "barber_id is required.").notEmpty();
  req.assert("request_check_in","Request Check in time required.").notEmpty();
  let errors = req.validationErrors();
  console.log(req.body.request_check_in);
  console.log(errors);
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }

  user.update({
    _id: req.headers.user_id
  }, {
    $set: {
      is_online: true,
      is_available: true
    }
  }).exec(function(err, result) {

  })

  appointment.findOne({
    _id: req.params.appointment_id
  }, function(err, result) {
    if (err) {
      return res.status(400).send({
        msg: "error in finding appointment.",
        err: errors
      });
    } else {
      console.log("result in appointment", result);
      if (result) {
        appointment.update({
          _id: req.params.appointment_id
        }, {
          $set: {
            "appointment_status": "completed",
            "request_check_in":req.body.request_check_in
          }
        }).exec(function(updateErr, UpdateData) {
          let mydata = "";
          callNotification("barber_complete_appointment", result.customer_id, result.barber_id, mydata)
          return res.status(200).send({
            msg: "Appointment is completed."
          });
        })
      } else {
        return res.status(400).send({
          msg: "Appointment is not present."
        });
      }
    }
  })
}
exports.getUsStates = function(req, res) {
  usStates.find({}, function(err, data) {
    return res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      data: data
    });
  })
}
exports.showServices = function(req, res) {
  console.log("show service");
  service.find({
    status: true
  }, function(err, serData) {
    return res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      data: serData
    });
  })
}
exports.uploadBarberGallery = function(req, res) {
  req.checkHeaders("user_id", "_id is required").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let updateData = {};
  updateData.modified_date = new Date()
  delete updateData._id;
  if ((req.files) && (req.files.length > 0)) {
    let userimg = [];
    for (let i = 0; i < req.files.length; i++) {
      let obj = {};
      obj.name = req.files[i].filename;
      userimg.push(obj);

    }
    updateData.gallery = userimg;
  }
  console.log("updateData.gallery", updateData.gallery);
  user.update({
    _id: req.headers.user_id
  }, {
    $push: {
      gallery: {
        $each: updateData.gallery
      }
    }
  }, function(errorInSaveChair, success) {
    if (errorInSaveChair) {
      res.status(400).send({
        msg: 'Error in finding shop.'
      });
    } else {
      user.findOne({
        _id: req.headers.user_id
      }, function(err, response) {
        if (err) {
          res.status(400).send({
            msg: constantObj.messages.errorRetreivingData,
            "err": err
          });
        } else {
          res.status(200).send({
            msg: 'Successfully updated fields.',
            "user": response,
            "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
          });
        }
      })
    }
  })
}

exports.financeScreenResult = function(req, res) {
  req.checkHeaders("user_id", "user_id is required").notEmpty();
  req.checkParams("startDate", "startDate is required.").notEmpty();
  req.checkParams("endDate", "endDate is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let barber_id = req.headers.user_id;
  console.log(req.params.startDate);
  console.log(req.params.endDate);

  function firstDayOfMonth() {
    var d = new Date(Date.apply(null, arguments));
    d.setDate(1);
    return d.toISOString();
  }

  function lastDayOfMonth() {
    var d = new Date(Date.apply(null, arguments));
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString();
  }
  var now = Date.now();
  /*Below line for getting the first date of current month*/
  let startDayOfMonth = firstDayOfMonth(now);
  /*Below line for getting the last date of current month*/
  let endDayOfMonth = lastDayOfMonth(now);
  /*Below line for getting the current week first day*/
  let currentDayOfweek = moment().day(0); // Sunday
  /*Below line for getting the current week last day*/
  let lastDayOfweek = moment().day(6); // saturday
  async.parallel({
    one: function(parallelCb) {
      // This callback will get the total sale of barber
      getBarberTotalSale(barber_id, function(err, result) {
        parallelCb(null, result)
      });
    },
    two: function(parallelCb) {
      // get barber total sales of current month
      getBarberTotalSaleOnDates(barber_id, startDayOfMonth, endDayOfMonth, function(err, result) {
        parallelCb(null, result)
      });
    },
    three: function(parallelCb) {
      // get barber sale of current week
      getBarberTotalSaleOnDates(barber_id, currentDayOfweek, lastDayOfweek, function(err, result) {
        parallelCb(null, result)
      });
    },
    four: function(parallelCb) {
      getBarberAppointmentsDetail(barber_id, req.params.startDate, req.params.endDate, function(err, result) {
        parallelCb(null, result)
      });
    }
  }, function(err, results) {
    // results will have the results of all 3
    console.log("barber total sale", results.one);
    console.log("barber month sale", results.two);
    console.log("barber week sale", results.four);
    console.log("barber sale b/w two dates", results.three);
    res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      data: {
        "totalSale": results.one,
        "monthSale": results.two,
        "weekSale": results.three,
        "custom": results.four
      }
    })
  });
}

let getBarberTotalSale = function(id, cb) {
    let barberId = mongoose.Types.ObjectId(id);
    appointment.aggregate([{
      $match: {
        barber_id: barberId,
        appointment_status: "completed"
      }
    }, {
      $unwind: "$services"
    }, {
      $group: {
        _id: "$_id",
        barber_id: {
          $first: "$barber_id"
        },
        price: {
          $sum: "$services.price"
        }
      }
    }, {
      $group: {
        _id: "$barber_id",
        total_sale: {
          $sum: "$price"
        }
      }
    }]).exec(function(err, result) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result)
      }
    })
  }
  // Total sale of barber between two dates
let getBarberTotalSaleOnDates = function(id, startDate, endDate, cb) {
  let barberId = mongoose.Types.ObjectId(id);
  let appointmentStartdate = new Date(moment(startDate, "YYYY-MM-DD").format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z');
  let appointmentEnddate = new Date(moment(endDate, "YYYY-MM-DD").add(1, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z');
  appointment.aggregate([{
    $match: {
      barber_id: barberId,
      appointment_status: "completed"
    }
  }, {
    $unwind: "$services"
  }, {
    $match: {
      appointment_date: {
        $gte: appointmentStartdate,
        $lt: appointmentEnddate
      }
    }
  }, {
    $group: {
      "_id": "$_id",
      "barber_id": {
        "$first": "$barber_id"
      },
      "price": {
        "$sum": "$services.price"
      }
    }
  }, {
    $group: {
      "_id": "$barber_id",
      "total_sale": {
        $sum: "$price"
      }
    }
  }]).exec(function(err, result) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result)
    }
  })
}
let getBarberAppointmentsDetail = function(id, startDate, endDate, cb) {
  let barber_id = mongoose.Types.ObjectId(id);
  let appointmentStartdate = new Date(moment(startDate, "YYYY-MM-DD").format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z');
  let appointmentEnddate = new Date(moment(endDate, "YYYY-MM-DD").add(1, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z');

  appointment.aggregate([{
    $match: {
      barber_id: barber_id,
      appointment_status: "completed"
    }
  }, {
    $unwind: "$services"
  }, {
    $match: {
      appointment_date: {
        $gte: appointmentStartdate,
        $lt: appointmentEnddate
      }
    }
  }, {
    $project: {
      _id: "$_id",
      services: 1,
      appointment_Date: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$appointment_date"
        }
      },
      appointment_id: "$_id",
    }
  }, {
    $group: {
      _id: "$_id",
      data: {
        $push: "$data"
      },
      appointment_Date: {
        $first: "$appointment_Date"
      },
      sale: {
        $sum: "$services.price"
      },

    }

  }, {
    $group: {
      _id: "$_id",
      sale: {
        $first: "$sale"
      },
      appointment_Date: {
        $first: "$appointment_Date"
      },
    }
  }, {
    $group: {
      _id: "$appointment_Date",
      appointments: {
        $sum: 1
      },
      sale: {
        $sum: "$sale"
      },
      appointment_Date: {
        $first: "$appointment_Date"
      },
    }
  }]).exec(function(err, result) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result)
    }
  })
}

exports.getReferUsers = function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var count = parseInt(req.query.count) || 30;
  var skipNo = (page - 1) * count;
  var query = {};
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
    }]
  }
  console.log(query);
  referal.aggregate([{
    $project: {
      "invite_as": 1,
      "referee_email": 1,
      "referral": 1,
      "created_date": 1,
      "is_refer_code_used": {
        $cond: [{
          $eq: ['$is_refer_code_used', true]
        }, 1, 0]
      }
    }

  }, {
    $group: {
      _id: "$referral",
      count: {
        $sum: 1
      },
      subscribe_users: {
        $sum: "$is_refer_code_used"
      }
    }
  }, {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'users'
    }
  }, {
    $project: {
      _id: "$_id",
      first_name: {
        $arrayElemAt: ["$users.first_name", 0]
      },
      last_name: {
        $arrayElemAt: ["$users.last_name", 0]
      },
      count: "$count",
      subscribe_users: "$subscribe_users",

    }
  }, {
    $match: query
  }]).exec(function(err, result) {
    referal.aggregate([{
      $project: {
        "invite_as": 1,
        "referee_email": 1,
        "referral": 1,
        "created_date": 1,
        "is_refer_code_used": {
          $cond: [{
            $eq: ['$is_refer_code_used', true]
          }, 1, 0]
        }
      }

    }, {
      $group: {
        _id: "$referral",
        count: {
          $sum: 1
        },
        subscribe_users: {
          $sum: "$is_refer_code_used"
        }
      }
    }, {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'users'
      }
    }, {
      $project: {
        _id: "$_id",
        first_name: {
          $arrayElemAt: ["$users.first_name", 0]
        },
        last_name: {
          $arrayElemAt: ["$users.last_name", 0]
        },
        count: "$count",
        subscribe_users: "$subscribe_users",

      }
    }, {
      $match: query
    }, {
      "$skip": skipNo
    }, {
      "$limit": count
    }]).exec(function(err, finalResult) {
      console.log("this working");
      res.status(200).send({
        msg: constantObj.messages.successRetreivingData,
        "data": finalResult,
        "count": result.length
      });
    })
  })
}
exports.referDetail = function(req, res) {
  // console.log("req.params",req.params);
  let findObj = req.body;
  console.log(findObj)
  referal.find(findObj).populate('referral').exec(function(err, data) {
    res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      "data": data
    })
  })
}

exports.deleteImages = function(req, res) {
  req.checkHeaders("user_id", "").notEmpty();
  req.checkParams("image_id", "Image _id is required").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  // let filePath = "../public/uploadedFiles/" + req.body.image_name;
  // fs.unlinkSync(filePath);
  user.update({
    "_id": req.headers.user_id
  }, {
    $pull: {
      "gallery": {
        "_id": req.params.image_id
      }
    }
  }, function(error, result) {
    if (error) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      user.findOne({
        _id: req.headers.user_id
      }, function(err, response) {
        if (err) {
          res.status(400).send({
            msg: constantObj.messages.errorRetreivingData,
            "err": err
          });
        } else {
          res.status(200).send({
            msg: 'Successfully updated fields.',
            "user": response,
            "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
          });
        }
      })
    }
  })
}

exports.barberunavailable = function(req, res) {
  user.update({
    _id: req.params._id
  }, {
    $set: {
      is_available: false
    }
  }, function(err, data) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: 'Successfully updated fields.',
        "user": data,
      });
    }
  })
}

exports.barberavailable = function(req, res) {
  user.update({
    _id: req.params._id
  }, {
    $set: {
      is_available: true
    }
  }, function(err, data) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: 'Successfully updated fields.',
        "user": data,
      });
    }
  })
}

exports.deleteBarber = function(req,res){
  console.log(req.params);
  user.update({
    _id: req.params._id
  }, {
    $set: {
      is_deleted: true
    }
  }, function(err, data) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: 'Successfully updated fields.',
        "user": data,
      });
    }
  })
}

exports.deleteAppointment = function(req,res){
  appointment.update({
    _id: req.params._id
  }, {
    $set: {
      is_deleted: true
    }
  }, function(err, data) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: 'Successfully updated fields.',
        "user": data,
      });
    }
  })
}