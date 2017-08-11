let user = require('../models/user');
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
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  var id = mongoose.Types.ObjectId(req.params.appointment_id);
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
        }, {
          $set: {
            "cancel_by_user_type": req.headers.user_type,
            "cancel_by_user_id": req.headers.user_id,
            "appointment_status": "cancel"
          }
        }, function(err, result) {

          console.log("asdfsdf", err, result);

          if (err) {
            res.status(400).send({
              msg: constantObj.messages.errorRetreivingData,
              "err": err
            });
          } else {
            res.status(200).send({
              msg: 'Successfully updated fields.',
              "data": result
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
  req.assert("customer_id", "Barber id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("text", "Text is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }

  commonObj.notify(req.body.customer_id, req.body.user_id, req.body.text, "message", function(err, data) {
    if (err) {
      console.log(err);
    } else {

    }
  })
  res.status(200).send({
    msg: "You msg is successfully send."
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
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }

  appointment.update({
    _id: req.params.appointment_id
  }, {
    $set: {
      "appointment_status": "confirm"
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
          }, function(err, userData) {
            if (userData) {
              let passObj = {};
              passObj.barberInfo = JSON.parse(JSON.stringify(userData))
              passObj.appointmentInfo = result
              callNotification("barber_confirm_appointment", result.customer_id, result.barber_id, passObj);
            }
          })
        }
      })
      return res.status(200).send({
        msg: constantObj.messages.userStatusUpdateSuccess
      });
    }
  })
}

/*
_________________________________________________________
Author:Hussain,
Created:10 aug 2017
Required fields:user_id,status.Status must b online and offline, 
Description:Barber chagne status to online and offline 
_________________________________________________________
 */

exports.barberToggleStatus = function(req, res) {
  req.checkHeaders("user_id", "user_id is required.").notEmpty();
  req.assert("status", "Action is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  if (req.body.status == 'online' || req.body.status == 'offline') {
    let status = (req.body.status == 'online') ? true : false
    user.update({
      _id: req.headers.user_id
    }, {
      $set: {
        'is_online': status
      }
    }, function(err, result) {
      if (err) {
        res.status(400).send({
          msg: constantObj.messages.errorRetreivingData,
          "err": err
        });
      } else {
        res.status(200).send({
          msg: 'You are online now.',
          "data": result
        });
      }
    })
  } else {
    return res.status(400).send({
      msg: "Staus should be online and offline."
    });
  }
}

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
  let id = mongoose.Types.ObjectId(req.params.barber_id);
  query._id = id
  query.user_type = "barber";
  user.aggregate([{
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
      is_online: "$is_online",
      is_available: "$is_available",
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
          console.log("shop barber data", data);
          if (data) {
            for (var i = 0; i < result.length; i++) {
              result[i].associateShops = [];
              for (j = 0; j < data.length; j++) {
                console.log(result[i]._id, data[j].barber_id)
                if (result[i]._id.equals(data[j].barber_id)) {
                  result[i].associateShops.push({
                    name: data[j].shopInfo[0].name
                  })
                }
              }
            }
            res.status(200).send({
              "msg": constantObj.messages.successRetreivingData,
              "data": result
            })
          } else {
            res.status(200).send({
              "msg": constantObj.messages.successRetreivingData,
              "data": result
            })
          }
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
    obj.zip = {
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
    shopBarber(obj).save(function(err, result) {
      console.log(err, result);
    })
  }
  res.status(200).send({
    "msg": "Shops added successfully."
  })
};
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
      }, function(err, userResult) {
        done(null, result, data, serData, userResult.is_online)
      })
    },
    function(result, data, serData, online, done) {
      console.log("asfasfasdfsfd", online);
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
            "appointment": appData[0]
          })
        } else {
          res.status(200).send({
            "msg": constantObj.messages.successRetreivingData,
            "associateShops": result,
            "revenue": data,
            "services": serData,
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
  let endDate = moment(currentDate, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD[T]HH:mm:ss.SSS");
  appointment.find({
    barber_id: req.headers.user_id,
    created_date: {
      $gte: new Date(currentDate).toISOString(),
      $lte: endDate + 'Z'
    },
    appointment_status: "completed"
  }).exec(function(err, result) {
    appointment.aggregate([{
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
    }]).exec(function(sumErr, sumResult) {
      if (sumErr) {
        cb(sumErr, null)
      } else {
        // console.log("sumResult", sumResult);
        // console.log("total cuts", result.length);
        // console.log("revenue", sumResult.totalPrice);
        let obj = {
          totalCuts: result.length
        }
        if (sumResult.length > 0) {
          obj.revenue = sumResult.totalPrice
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
    let errors = req.validationErrors();
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
        }).exec(function(err,result){

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
                  "appointment_status": "completed"
                }
              }).exec(function  (updateErr,UpdateData) {
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