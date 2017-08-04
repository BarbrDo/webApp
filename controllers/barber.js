let user = require('../models/user');
let service = require('../models/service');
let constantObj = require('./../constants.js');
let async = require('async');
let notification = require('../models/notification');
let appointment = require('../models/appointment');
let commonObj = require('../common/common');
let shop = require('../models/shop');
let mongoose = require('mongoose');

exports.addBarberServices = function(req, res) {
  req.checkHeaders('user_id', 'User id cannot be blank.').notEmpty();
  req.assert("services", 'services cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.status(400).send({msg: "error in your request", err: errors});
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
          return res.send(400, {"msg": "Error in saving services"});
        } else {
          res.status(200).send({"msg": "Servies saved."});
        }
      })
    }
  ])
}

exports.cancelAppointment = function(req, res) {
  req.checkParams("appointment_id", "Appointment id is required.").notEmpty();
  req.checkHeaders("user_type", "User type is required.").notEmpty();
  req.checkHeaders("user_id", "User Id cannot be blank").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  appointment.findOne({
    _id: req.params.appointment_id
  }, function(err, result) {
    if (err) {
      return res.status(400).send({msg: "error in finding appointment.", err: errors});
    } else {
      console.log("result in appointment", result);
      if (result) {
        if (req.headers.user_type == 'barber') {
          callNotification("barber_cancel_appointment", result.customer_id, result.barber_id);
        } else if (req.headers.user_type == 'customer') {
          callNotification("customer_cancel_appointment", result.barber_id, result.customer_id);
        }
        appointment.update({
          _id: req.params.appointment_id
        }, {
          $set: {
            "appointment_status": "cancel",
            "cancel_by": req.headers.user_id
          }
        }, function(err, result) {
          if (err) {
            res.status(400).send({msg: constantObj.messages.errorRetreivingData, "err": err});
          } else {
            res.status(200).send({msg: 'Successfully updated fields.', "data": result});
          }
        })
      } else {
        res.status(400).send({msg: "No record found"});
      }
    }
  })
};

exports.sendMessageToCustomer = function(req, res) {
  req.assert("customer_id", "Barber id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("text", "Text is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  callNotification(req.body.text, req.body.customer_id, req.body.user_id);
  res.status(200).send({msg: "You msg is successfully send."});
}

exports.barberActionOnRequest = function(req, res) {
  //Mark Appointment as confirmed
  req.checkHeaders("user_id", "user_id is required.").notEmpty();
  req.checkParams("appointment_id", "Appointment _id is required.").notEmpty();
  req.assert("action", "Action is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  if (req.body.action == 'confirm' || req.body.action == 'cancel') {
    appointment.update({
      _id: req.params.appointment_id
    }, {
      $set: {
        "appointment_status": "confirm"
      }
    }, function(err, result) {
      if (err) {
        return res.status(400).send({msg: constantObj.messages.userStatusUpdateFailure});
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
            if (req.body.action == 'confirm') {
              callNotification("barber_confirm_appointment", result.customer_id, result.barber_name);
            } else if (req.body.action == 'cancel') {
              callNotification("barber_cancel_appointment", result.customer_id, result.barber_name);
            }
          }
        })
        return res.status(200).send({msg: constantObj.messages.userStatusUpdateSuccess});
      }
    })
  } else {
    return res.status(400).send({msg: "Your request is wrong."});
  }
}

exports.barberToggleStatus = function(req, res) {
  req.checkHeaders("user_id", "user_id is required.").notEmpty();
  req.assert("status", "Action is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  if (req.body.status == 'online' || req.body.status == 'offline') {
    let status = (req.body.status == 'online')
      ? true
      : false
    user.update({
      _id: req.headers.user_id
    }, {
      $set: {
        'is_online': status
      }
    }, function(err, result) {
      if (err) {
        res.status(400).send({msg: constantObj.messages.errorRetreivingData, "err": err});
      } else {
        res.status(200).send({msg: 'You are online now.', "data": result});
      }
    })
  } else {
    return res.status(400).send({msg: "Staus should be online and offline."});
  }
}

exports.viewBarberProfile = function(req, res) {
  console.log("view barber profile");
  req.checkParams("barber_id", "barber ID is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  var id = mongoose.Types.ObjectId(req.params.barber_id);
  user.findOne({_id: id}).exec(function(err, data) {
    if (err) {
      res.status(400).send({msg: constantObj.messages.errorRetreivingData, err: err});
    } else {
      appointment.find({
        barber_id: req.params.barber_id,
        "appointment_status": ""
      }, function(appErr, appData) {
        res.status(200).send({msg: constantObj.messages.successRetreivingData, "data": data, "no_of_cuts": appData.length});
      })
    }
  })
}

let callNotification = function(type, to_user_id, from_user_id) {
  notification.findOne({
    "type": type
  }, function(err, result) {
    console.log("result", result);
    if (result) {
      // passing arguments like to_user_id,from_user_id, and text
      commonObj.notify(to_user_id, from_user_id, result.text, type, function(err, data) {
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
      res.status(400).send({msg: constantObj.messages.errorRetreivingData, err: err})
    } else {
      res.status(200).send({msg: constantObj.messages.successRetreivingData, "data": data})
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
    return res.status(400).send({msg: "error in your request", err: errors});
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
      res.status(400).send({msg: constantObj.messages.errorInSave, "err": err});
    } else {
      res.status(200).send({msg: constantObj.messages.saveSuccessfully, "data": result});
    }
  })
}

exports.editBarberServices = function(req, res) {
  console.log(req.body);
  req.checkHeaders("user_id", "User Id is required").notEmpty();
  req.checkParams("barber_service_id", "Barber Service Id is required").notEmpty();
  req.assert("price", "Service Price is required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({msg: "error in request", err: req.validationErrors()})
  }
  barber_service.update({
    service_id: req.params.barber_service_id
  }, {
    $set: {
      "price": req.body.price
    }
  }, function(err, result) {
    if (err) {
      res.status(400).send({msg: constantObj.messages.userStatusUpdateFailure})
    } else {
      res.status(200).send({msg: constantObj.messages.userStatusUpdateSuccess})
    }
  })
}

exports.deleteBarberService = function(req, res) {
  req.checkHeaders("user_id", "User Id is required").notEmpty();
  req.checkParams("barber_service_id", "Barber Service Id is required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({msg: "error in request", err: req.validationErrors()})
  }

  barber_service.update({
    _id: req.params.barber_service_id
  }, {
    $set: {
      "is_deleted": true
    }
  }, function(err, result) {
    if (err) {
      res.status(400).send({msg: constantObj.messages.userStatusUpdateFailure})
    } else {
      res.status(200).send({msg: constantObj.messages.userDeleteSuccess})
    }
  })
}

exports.viewAllServiesOfBarber = function(req, res) {
  req.checkParams("user_id", "user_id is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  console.log("database", req.params.barber_id)
  user.findOne({
    "_id": req.headers.barber_id
  }, function(err, data) {
    console.log()
    if (err) {
      res.status(400).send({msg: constantObj.messages.errorRetreivingData, err: err});
    } else {
      res.status(200).send({msg: constantObj.messages.successRetreivingData, "data": data});
    }
  })
}
exports.countbarber = function(req, res) {

  user.find({
    user_type: "barber"
  }, function(err, barber) {
    res.json(barber);
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
  query._id = mongoose.Types.ObjectId(req.params.barber_id);
  query.user_type = "barber";
  user.aggregate([
    {
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
        user_type: "$user_type",
        latLong: "$latLong",
        picture: "$picture",
        name: "$shopdetails.name",
        shop: "$shopdetails",
        gallery: "$gallery"
      }
    }, {
      $match: query
    }
  ]).exec(function(err, result) {
    if (err) {
      res.status(400).send({"msg": constantObj.messages.userStatusUpdateFailure, "err": err});
    } else {
      res.status(200).send({"msg": constantObj.messages.successRetreivingData, "data": result})
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
    query.$or = [
      {
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
      }
    ]
  }
  console.log(query);
  user.aggregate([
    {
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
    }
  ]).exec(function(err, data) {
    if (err) {
      console.log(err)
    } else {
      var length = data.length;
      user.aggregate([
        {
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
        }
      ]).exec(function(err, result) {
        if (err) {
          res.status(400).send({"msg": constantObj.messages.userStatusUpdateFailure, "err": err});
        } else {
          res.status(200).send({"msg": constantObj.messages.successRetreivingData, "data": result, "count": length})
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
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  console.log(req.body);
  console.log(req.headers);
  let updateData = {
    "$push": {
      "ratings": {
        "rated_by": req.headers.user_id,
        "score": parseInt(req.body.score),
        "appointment_id": req.body.appointment_id
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
            return res.status(400).send({msg: "no record found", err: err});
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
          return res.status(400).send({msg: constantObj.messages.userStatusUpdateFailure, err: err});
        } else {
          return res.status(200).send({msg: constantObj.messages.userStatusUpdateSuccess});
          done(err);
        }
      })
    }
  ])
}
exports.goOnline = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("services", "service are required.").notEmpty();
  req.assert("shop_id", "shop_id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
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
          barber_services: req.body.services
        }
      }
      user.update({
        _id: req.headers.user_id
      }, updateData, function(err, result) {
        if (err) {
          return res.status(400).send({msg: "Error in getting online.", err: err});
        } else {
          return res.status(200).send({msg: "You are online now.", "data": result});
        }
      })
    } else {
      return res.status(400).send({msg: "This shop is not present."});
    }
  })
};
exports.goOffline = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
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
          return res.status(200).send({msg: "You are online now."});
        })
      } else {
        return res.status(400).send({msg: "You can't go offline now."});
      }
    }
  })
};
exports.findShops = function(req, res) {
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
    obj.zip = {
      $regex: req.query.city,
      '$options': 'i'
    }
  }
  console.log(obj);
  shop.find({$and: [obj]}).exec(function(err, result) {
    if (err) {
      res.status(400).send({"msg": constantObj.messages.userStatusUpdateFailure, "err": err});
    } else {
      res.status(200).send({"msg": constantObj.messages.successRetreivingData, "data": result})
    }
  })
};
exports.functionName = function () {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  currentRevenue(req,res)
};
let currentRevenue = function(req,res) {
  var currentDate = moment().format("YYYY-MM-DD");
  let endDate = moment(currentDate, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD[T]HH:mm:ss.SSS");
  appointment.find({
    barber_id:req.headers.user_id,
    created_date: {
      $gte: new Date(currentDate).toISOString(),
      $lte: endDate + 'Z'
    },
    appointment_status: "completed"
  }).exec(function(err, result) {
    appointment.aggregate([
      {
        $match: {
          created_date: {
            $gte: new Date(currentDate).toISOString(),
            $lte: endDate + 'Z'
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
      }
    ]).exec(function(sumErr, sumResult) {
      res.status(200).send({"msg": constantObj.messages.successRetreivingData, "totalCuts": result.length, "count": sumResult.totalPrice})
    })
  })
}
