let user = require('../models/user');
let constantObj = require('./../constants.js');
let notification = require('../models/notification');
let appointment = require('../models/appointment');
let commonObj = require('../common/common');
let moment = require('moment');
let mongoose = require('mongoose');
let geolib = require('geolib');
let _ = require('lodash');
let referal = require('../models/referral');
let async = require('async');

exports.getNearbyBarbers = function(req, res) {
  req.checkHeaders("user_id", "User ID is required").notEmpty();
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let long = parseFloat(req.headers.device_longitude);
  let lati = parseFloat(req.headers.device_latitude);
  let maxDistanceToFind = constantObj.distance.shopDistance; // in miles in km 0.001
  var id = mongoose.Types.ObjectId(req.headers.user_id);
  user.aggregate([{
    $geoNear: {
      query: {
        user_type: "barber",
        is_active: true,
        is_verified: true,
        is_deleted: false,
        is_online: true,
        is_available: true
      },
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
    $lookup: {
      from: 'shops',
      localField: 'barber_shop_id',
      foreignField: '_id',
      as: 'shopInfo'
    }
  }, {
    $project: {
      _id: 1,
      email: 1,
      first_name: 1,
      last_name: 1,
      mobile_number: 1,
      picture: 1,
      gallery: 1,
      ratings: 1,
      is_online: 1,
      is_available: 1,
      barber_services: 1,
      distance: "$dist.calculated",
      units: {
        $literal: "miles"
      },
      is_favourite: {
        $literal: false
      },
      barber_shops: {
        $arrayElemAt: ["$shopInfo", 0]
      }
    }
  }]).exec(function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      user.aggregate([{
        $match: {
          "_id": id
        }
      }, {
        $unwind: "$favourite_barber"
      }, {
        $lookup: {
          from: 'users',
          localField: 'favourite_barber.barber_id',
          foreignField: '_id',
          as: 'favBarbers'
        }
      }, {
        $project: {
          favBarbers: {
            $arrayElemAt: ["$favBarbers", 0]
          }
        }
      }, {
        $lookup: {
          from: 'shops',
          localField: 'favBarbers.barber_shop_id',
          foreignField: '_id',
          as: 'shopInfo'
        }
      }, {
        $project: {
          _id: "$favBarbers._id",
          first_name: "$favBarbers.first_name",
          last_name: "$favBarbers.last_name",
          email: "$favBarbers.email",
          mobile_number: "$favBarbers.mobile_number",
          gallery: "$favBarbers.gallery",
          ratings: "$favBarbers.ratings",
          picture: "$favBarbers.picture",
          barber_services: "$favBarbers.barber_services",
          is_available: "$favBarbers.is_available",
          is_online: "$favBarbers.is_online",
          barber_shop_latLong: "$favBarbers.barber_shops_latLong",
          barber_shops: {
            $arrayElemAt: ["$shopInfo", 0]
          },
          units: {
            $literal: "miles"
          },
        }
      }]).exec(function(err, favBarbers) {
        console.log("favBarbers", JSON.stringify(favBarbers));
        console.log("All barers", JSON.stringify(result));
        console.log("length of fav barber", favBarbers.length);
        console.log("length of all barber", result.length);
        let resultTantArray = [];
        if (favBarbers.length > 0) {
          for (var i = 0; i < favBarbers.length; i++) {
            let latLngGeo = geolib.getDistance({
              latitude: lati,
              longitude: long
            }, {
              latitude: favBarbers[i].barber_shop_latLong[1],
              longitude: favBarbers[i].barber_shop_latLong[0]
            });
            let distance = geolib.convertUnit('mi', latLngGeo, 2);
            let obj = favBarbers[i]
            obj.is_favourite = true;
            obj.distance = distance
            resultTantArray.push(obj)
            for (var j = 0; j < result.length; j++) {
              console.log("fav and all", favBarbers[i]._id, result[j]._id)
              if (favBarbers[i]._id.equals(result[j]._id)) {
                result.splice(j, 1)
              }
            }
          }
          resultTantArray = resultTantArray.concat(result);
          resultTantArray.sort(function(a, b) {
            return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
          });

          resultTantArray.sort(function(a, b) {
            return (a.is_favourite < b.is_favourite) ? 1 : ((b.is_favourite < a.is_favourite) ? -1 : 0);
          });

          return res.status(200).send({
            msg: constantObj.messages.successRetreivingData,
            data: resultTantArray
          });
        } else {
          return res.status(200).send({
            msg: constantObj.messages.successRetreivingData,
            data: result
          });
        }
      })
    }
  })
}

exports.customerRequestToBarber = function(req, res) {
  req.checkHeaders("user_id", "User Id cannot be blank").notEmpty();
  req.assert("shop_id", "Shop Id cannot be blank").notEmpty();
  req.assert("barber_id", "Barber Id cannot be blank").notEmpty();
  req.assert("services", "servies cannot be blank").notEmpty();
  req.assert("appointment_date", "appointment_date cannot be blank").notEmpty();
  req.assert("totalPrice", "totalPrice cannot be blank").notEmpty();
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let saveData = req.body;
  saveData.customer_id = req.headers.user_id;
  saveData.appointment_date = removeOffset(req.body.appointment_date);

  user.findOne({
    _id: req.body.barber_id
  }, function(usrerr, usrResult) {
    if (usrResult) {
      if (usrResult.is_online && usrResult.is_available) {
        appointment(saveData).save(function(err, data) {
          if (err) {
            return res.status(400).send({
              msg: constantObj.messages.errorInSave
            });
          } else {
            console.log("appointmentid ", data._id);
            callNotification("customer_request_to_barber", saveData.barber_id, saveData.customer_id, data)
            res.status(200).send({
              msg: constantObj.messages.saveSuccessfully,
              "data": data
            })
          }
        })
      } else {
        return res.status(400).send({
          msg: "Barber goes offline now."
        });
      }
    } else {
      return res.status(400).send({
        msg: "Given barber is not present."
      });
    }
  })
};

let removeOffset = function(dobFormat) {
  let userOffset = new Date(dobFormat).getTimezoneOffset();
  let userOffsetMilli = userOffset * 60 * 1000;
  let dateInMilli = moment(dobFormat).unix() * 1000;
  let dateInUtc = dateInMilli - userOffsetMilli;
  return dateInUtc;
}

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
        user.update({
          _id: result.barber_id
        }, {
          $set: {
            is_online: true,
            is_available: true
          }
        }, function(err, result) {

        })
        let data = ""
        callNotification("customer_cancel_appointment", result.barber_id, result.customer_id, data);
        appointment.update({
          _id: req.params.appointment_id
        }, {
          $set: {
            "cancel_by_user_type": req.headers.user_type,
            "cancel_by_user_id": req.headers.user_id,
            "appointment_status": "cancel"
          }
        }, function(err, result) {
          if (err) {
            res.status(400).send({
              msg: constantObj.messages.errorRetreivingData,
              "err": err
            });
          } else {
            res.status(200).send({
              msg: 'Successfully retrieve fields.',
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

exports.addFavouriteBarber = function(req, res) {
  req.assert("barber_id", "Barber id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log(req.body.barber_id);
  console.log(req.headers.user_id);
  user.update({
    _id: req.headers.user_id
  }, {
    $push: {
      favourite_barber: {
        barber_id: req.body.barber_id
      }
    }
  }).exec(function(err, data) {
    if (err) {
      return res.send(400, {
        "msg": "Error in adding services."
      });
    } else {
      res.status(200).send({
        "msg": "Favourite barber added."
      });
    }
  })
};

exports.allFavouriteBarbers = function(req, res) {
  req.checkHeaders("user_id", "User ID is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  var id = mongoose.Types.ObjectId(req.headers.user_id);
  user.aggregate([{
    $match: {
      "_id": id
    }
  }, {
    $unwind: "$favourite_barber"
  }, {
    $lookup: {
      from: 'users',
      localField: 'favourite_barber.barber_id',
      foreignField: '_id',
      as: 'favBarbers'
    }
  }, {
    $project: {
      favBarbers: {
        $arrayElemAt: ["$favBarbers", 0]
      }
    }
  }, {
    $lookup: {
      from: 'shops',
      localField: 'favBarbers.barber_shop_id',
      foreignField: '_id',
      as: 'shopInfo'
    }
  }, {
    $project: {
      _id: "$favBarbers._id",
      first_name: "$favBarbers.first_name",
      last_name: "$favBarbers.last_name",
      email: "$favBarbers.email",
      mobile_number: "$favBarbers.mobile_number",
      gallery: "$favBarbers.gallery",
      picture: "$favBarbers.picture",
      ratings: "$favBarbers.ratings",
      barber_services: "$favBarbers.barber_services",
      is_available: "$favBarbers.is_available",
      is_online: "$favBarbers.is_online",
      barber_shop_latLong: "$favBarbers.barber_shops_latLong",
      barber_shops: {
        $arrayElemAt: ["$shopInfo", 0]
      }
    }
  }]).exec(function(err, result) {
    if (err) {
      return res.status(400).send({
        msg: constantObj.messages.errorRetreivingData
      });
    } else {
      return res.status(200).send({
        msg: constantObj.messages.successRetreivingData,
        data: result
      });
    }
  })
}

exports.removeFavouriteBarber = function(req, res) {
  req.checkParams("barber_id", "barber_id required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  user.update({
    "_id": req.headers.user_id
  }, {
    $pull: {
      "favourite_barber": {
        "barber_id": req.params.barber_id
      }
    }
  }).exec(function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: 'Successfully removed barber.'
      });
    }
  })
}

exports.sendMessageToBarber = function(req, res) {
  req.assert("barber_id", "Barber id is required.").notEmpty();
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
  }, function(err, data) {
    if (data) {
      let obj = {
        text: req.body.text,
        customerInfo: data
      }
      commonObj.notify(req.body.barber_id, req.headers.user_id, "sent you a message", "message_to_barber", obj, function(err, data) {
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

//exports.viewBarberProfile = function(req, res) {
//  req.checkParams("barber_id", "barber ID is required").notEmpty();
//  var errors = req.validationErrors();
//  if (errors) {
//    return res.status(400).send({msg: "error in your request", err: errors});
//  }
//  var id = mongoose.Types.ObjectId(req.params.barber_id);
//  user.findOne({_id: id}).exec(function(err, data) {
//    if (err) {
//      res.status(400).send({msg: constantObj.messages.errorRetreivingData, err: err});
//    } else {
//      res.status(200).send({msg: constantObj.messages.successRetreivingData, "data": data});
//    }
//  })
//}

let callNotification = function(type, to_user_id, from_user_id, data) {
  notification.findOne({
    "type": type
  }, function(err, result) {
    console.log("result", result);
    if (result) {
      console.log("data", data);
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

//Admin function

exports.login = function(req, res) {
  console.log(req.body);
  if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
    res.status(200).send({
      "msg": "You have successfully login."
    })
  } else {
    res.status(400).send({
      "msg": "You are not authorized."
    })
  }
}
exports.countcustomer = function(req, res) {
  user.find({
    user_type: "customer"
  }, function(err, barber) {
    res.json(barber);
  });
};

exports.deletecustomer = function(req, res) {
  console.log(req.params.cust_id);
  user.update({
    _id: req.params.cust_id
  }, {
    $set: {
      is_deleted: true
    }
  }, function(err, count) {
    user.find({
      user_type: "customer"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });

};
exports.undeletecustomer = function(req, res) {
  console.log("undel", req.params.cust_id);
  user.update({
    _id: req.params.cust_id
  }, {
    $set: {
      is_deleted: false
    }
  }, function(err, count) {
    user.find({
      user_type: "customer"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });

};
exports.activatecustomer = function(req, res) {
  console.log("custid", req.params.cust_id);
  user.update({
    _id: req.params.cust_id
  }, {
    $set: {
      is_active: true
    }
  }, function(err, count) {
    user.find({
      user_type: "customer"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });

};
exports.disapprovecustomer = function(req, res) {
  console.log("custid", req.params.cust_id);
  user.update({
    _id: req.params.cust_id
  }, {
    $set: {
      is_verified: false
    }
  }, function(err, count) {
    user.find({
      user_type: "customer"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });
};
exports.verifycustomer = function(req, res) {
  console.log("custid", req.params.cust_id);
  user.update({
    _id: req.params.cust_id
  }, {
    $set: {
      is_verified: true
    }
  }, function(err, count) {
    user.find({
      user_type: "customer"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });

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
  console.log("custdet", query._id)
  query.user_type = "customer";
  user.aggregate([{
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
    if (err) {
      res.status(400).send({
        "msg": constantObj.messages.errorRetreivingData,
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

exports.customerAppointments = function(req, res) {
  req.checkHeaders("user_id", "user_id cannot be blank").notEmpty();
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
        $eq: req.headers.user_id
      },
      "appointment_status": {
        $in: ['confirm']
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
        console.log("res", result);
        appointment.find({
            "customer_id": {
              $exists: true,
              $eq: req.headers.user_id
            },
            "appointment_status": {
              $in: ['completed']
            },
            "is_rating_given": false
          }).populate('barber_id', 'first_name last_name ratings picture created_date')
          .populate('customer_id', 'first_name last_name ratings picture created_date email mobile_number latLong is_active is_verified is_deleted ratings')
          .populate('shop_id', 'name address city state gallery latLong created_date user_id')
          .exec(function(err, data) {

            if (err) {
              return res.status(400).send({
                msg: constantObj.messages.errorRetreivingData
              });
            } else {
              console.log("result", data)
              return res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                data: {
                  confirm: result,
                  complete: data
                }
              });
            }
          })
      }
    })
}
exports.deactivecustomer = function(req, res) {
  console.log("custid", req.params.cust_id);
  user.update({
    _id: req.params.cust_id
  }, {
    $set: {
      is_active: false
    }
  }, function(err, count) {
    user.find({
      user_type: "customer"
    }, function(err, shopss) {
      res.json(shopss);
    });
  });

};
exports.listcustomers = function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var count = parseInt(req.query.count) || 10;
  var skipNo = (page - 1) * count;
  console.log("skip", page)
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

  user.aggregate([{
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
  }]).exec(function(err, data) {
    if (err) {
      console.log(err)
    } else {

      var length = data.length;
      user.aggregate([{
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
        if (err) {
          res.status(400).send({
            "msg": constantObj.messages.errorRetreivingData,
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
exports.timeSlots = function(req, res) {
  res.status(200).send({
    "msg": constantObj.messages.successRetreivingData,
    "data": constantObj.offTimeSlots
  })
};

exports.getCustomerLastAppointment = function(req, res) {
  req.checkHeaders("user_id", "user_id is required.").notEmpty();
  req.checkParams("appointment_id", "Appointment _id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }

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
        }
      })
    }
  })
}

exports.rateBarber = function(req, res) {
  console.log("req.body", req.body);
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("appointment_id", "Appointment _id is required.").notEmpty();
  req.assert("appointment_date", "Appointment Date is required").notEmpty();
  req.assert("next_in_chair", "Next_in_chair is required.").notEmpty();
  req.assert("barber_id", "Barber id is required.").notEmpty();
  req.assert("score", "score is required.").notEmpty();
  req.assert("is_favourite", "Is favorite is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let updateData = {
    "$push": {
      "ratings": {
        "rated_by": req.headers.user_id,
        "score": parseInt(req.body.score),
        "appointment_id": req.body.appointment_id,
        "appointment_date": req.body.appointment_date
      }
    }
  }


  if (req.body.is_favourite) {
    console.log("inside is_favourite");
    user.findOne({
      _id: req.headers.user_id,
      "favourite_barber.barber_id": req.body.barber_id
    }).exec(function(err, result) {
      if (result) {
        console.log("this is already a fav barber");
      } else {
        user.update({
          _id: req.headers.user_id
        }, {
          $push: {
            favourite_barber: {
              barber_id: req.body.barber_id
            }
          }
        }, function(err, result) {
          console.log("is_favourite", err, result);
        })
      }
    })
  }
  console.log(updateData);
  async.waterfall([
    function(done) {
      appointment.update({
        _id: req.body.appointment_id
      }, {
        $set: {
          next_in_chair: req.body.next_in_chair,
          is_rating_given: true,
          rating_score: parseInt(req.body.score),
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

exports.referapp = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("invite_as", "Invite as in required.").notEmpty();
  req.checkHeaders("device_type", "Device Type is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  if (req.body.referee_email) {
    req.assert('referee_email', 'Email is not valid').isEmail();
    req.assert('referee_email', 'Email cannot be blank').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
      return res.status(400).send({
        msg: "error in your request",
        err: errors
      });
    }
    let from = constantObj.barbermailId.mail;
    let subject = "Use our app";
    let text = "";
    if (req.headers.device_type == 'ios') {
      text = constantObj.appleUrl.url;
    }
    if (req.headers.device_type == 'android') {
      text = constantObj.androidUrl.url;
    }
    commonObj.sendMail(req.body.referee_email, from, subject, text, function(err, result) {
      console.log("mail in referapp", err, result)
      if (result) {
        saveRefferApp(req, res);
      }
    })
  } else if (req.body.referee_phone_number) {
    let text = "";
    if (req.headers.device_type == 'ios') {
      text = constantObj.appleUrl.url;
    }
    if (req.headers.device_type == 'android') {
      text = constantObj.androidUrl.url;
    }
    commonObj.sentMessage(text, req.body.referee_phone_number, function(err, result) {
      console.log("twilio in referapp", err, result)
      if (result) {
        saveRefferApp(req, res);
      }
    })
  } else {
    return res.status(400).send({
      msg: "Please specify how you want to sent referral code."
    });
  }
}

let saveRefferApp = function(req, res) {
  let saveObj = req.body;
  saveObj.referral = req.headers.user_id;
  referal(saveObj).save(function(err, result) {
    if (err) {
      return res.status(200).send({
        msg: constantObj.messages.errorInSave,
        err: err
      });
    } else {
      return res.status(200).send({
        msg: "You successfully refer the app.."
      });
    }
  })
}
exports.allappointment = function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var count = parseInt(req.query.count) || 100;
  var skipNo = (page - 1) * count;
  var query = {};
  var searchStr = ""
  console.log("skipNo",skipNo);
  console.log("count",count);
  if (req.query.search) {
    searchStr = req.query.search;
  }
  if (searchStr) {
    query.$or = [{
      shop_name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }, {
      barber_first_name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }, {
      barber_last_name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }, {
      customer_first_name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }, {
      customer_last_name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }, {
      cancel_by_user_first_name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }, {
      cancel_by_user_last_name: {
        $regex: searchStr,
        '$options': 'i'
      }
    }]
  }

  appointment.aggregate([{
    $lookup: {
      from: "shops",
      localField: "shop_id",
      foreignField: "_id",
      as: "shop_info"
    }
  }, {
    $lookup: {
      from: "users",
      localField: "barber_id",
      foreignField: "_id",
      as: "barber_info"
    }
  }, {
    $lookup: {
      from: "users",
      localField: "customer_id",
      foreignField: "_id",
      as: "customer_info"
    }
  }, {
    $lookup: {
      from: "users",
      localField: "cancel_by_user_id",
      foreignField: "_id",
      as: "cancel_by_user_info"
    }
  }, {
    $project: {
      _id: "$_id",
      appointment_date: "$appointment_date",
      totalPrice: "$totalPrice",
      created_date: "$created_date",
      services: "$services",
      appointment_status: "$appointment_status",
      is_rating_given: "$is_rating_given",
      cancel_by_user_type: "$cancel_by_user_type",
      shop_name: {
        $arrayElemAt: ["$shop_info.name", 0]
      },
      barber_first_name: {
        $arrayElemAt: ["$barber_info.first_name", 0]
      },
      barber_last_name: {
        $arrayElemAt: ["$barber_info.last_name", 0]
      },
      customer_first_name: {
        $arrayElemAt: ["$customer_info.first_name", 0]
      },
      customer_last_name: {
        $arrayElemAt: ["$customer_info.last_name", 0]
      },
      cancel_by_user_first_name: {
        $arrayElemAt: ["$cancel_by_user_info.first_name", 0]
      },
      cancel_by_user_last_name: {
        $arrayElemAt: ["$cancel_by_user_info.last_name", 0]
      },
    }
  }]).exec(function(err, data) {
    if (err) {
      console.log(err)
    } else {
      var length = data.length;
      appointment.aggregate([{
        $lookup: {
          from: "shops",
          localField: "shop_id",
          foreignField: "_id",
          as: "shop_info"
        }
      }, {
        $lookup: {
          from: "users",
          localField: "barber_id",
          foreignField: "_id",
          as: "barber_info"
        }
      }, {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer_info"
        }
      }, {
        $lookup: {
          from: "users",
          localField: "cancel_by_user_id",
          foreignField: "_id",
          as: "cancel_by_user_info"
        }
      }, {
        $project: {
          _id: "$_id",
          appointment_date: "$appointment_date",
          totalPrice: "$totalPrice",
          created_date: "$created_date",
          services: "$services",
          appointment_status: "$appointment_status",
          is_rating_given: "$is_rating_given",
          cancel_by_user_type: "$cancel_by_user_type",
          shop_name: {
            $arrayElemAt: ["$shop_info.name", 0]
          },
          barber_first_name: {
            $arrayElemAt: ["$barber_info.first_name", 0]
          },
          barber_last_name: {
            $arrayElemAt: ["$barber_info.last_name", 0]
          },
          customer_first_name: {
            $arrayElemAt: ["$customer_info.first_name", 0]
          },
          customer_last_name: {
            $arrayElemAt: ["$customer_info.last_name", 0]
          },
          cancel_by_user_first_name: {
            $arrayElemAt: ["$cancel_by_user_info.first_name", 0]
          },
          cancel_by_user_last_name: {
            $arrayElemAt: ["$cancel_by_user_info.last_name", 0]
          },
        }
      },{
        $match: query
      }, {
        "$skip": skipNo
      }, {
        "$limit": count
      }]).exec(function(err, result) {
        if (err) {
          res.status(400).send({
            "msg": constantObj.messages.errorRetreivingData,
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
}