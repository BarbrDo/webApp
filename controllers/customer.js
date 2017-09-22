let user = require('../models/User');
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
let fs = require('fs');
let path = require('path');

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
  user.findOne({
    _id: req.headers.user_id
  }, function(err, userInfo) {
    let maxDistanceToFind = constantObj.distance.shopDistance; // in miles in km 0.001
    if (userInfo) {
      maxDistanceToFind = (userInfo.radius_search) * 10000;
    }
    let long = parseFloat(req.headers.device_longitude);
    let lati = parseFloat(req.headers.device_latitude);

    var id = mongoose.Types.ObjectId(req.headers.user_id);
    console.log("max distance to find", maxDistanceToFind);
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
  })
}

exports.customerRequestToBarber = function(req, res) {
  req.checkHeaders("user_id", "User Id cannot be blank").notEmpty();
  req.assert("shop_id", "Shop Id cannot be blank").notEmpty();
  req.assert("barber_id", "Barber Id cannot be blank").notEmpty();
  req.assert("services", "servies cannot be blank").notEmpty();
  req.assert("appointment_date", "appointment_date cannot be blank").notEmpty();
  req.assert("reach_in", "reach_in cannot be blank").notEmpty();
  req.assert("totalPrice", "totalPrice cannot be blank").notEmpty();
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();

  let errors = req.validationErrors();
  console.log("error in request", errors)
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let saveData = req.body;
  saveData.customer_id = req.headers.user_id;
  saveData.appointment_date = removeOffset(req.body.appointment_date);
  saveData.created_date = removeOffset(req.body.appointment_date);
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
          msg: "Whoops!  This is embarrassing... it looks like the barber has gone offline.  Please try searching for another barber."
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
  req.assert("request_cancel_on", "Request cancel Date is required.").notEmpty();
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
            "appointment_status": "cancel",
            "request_cancel_on": req.body.request_cancel_on
          }
        }, function(err, result) {
          if (err) {
            res.status(400).send({
              msg: constantObj.messages.errorRetreivingData,
              "err": err
            });
          } else {
            res.status(200).send({
              msg: 'You have successfully cancelled your request!',
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


exports.countcustomer = function(req, res) {
  user.find({
    user_type: "customer",
    "is_deleted" : false,
    "is_active" : true
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
      appointment.find({
        barber_id: req.params.barber_id,
        appointment_status: "completed"
      }, function(appErr, appData) {
        res.status(200).send({
          "msg": constantObj.messages.successRetreivingData,
          "data": result,
          "cuts": appData.length
        })
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
  user.findOne({
    _id: req.headers.user_id
  }, {
    favourite_barber: 1
  }, function(err, data) {
    console.log(data);
    let fevBarberArray = [];
    for (var i = 0; i < data.favourite_barber.length; i++) {
      fevBarberArray.push(data.favourite_barber[i].barber_id);
    }
    console.log(fevBarberArray);
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
      .populate('shop_id', 'name address zip city state gallery latLong created_date user_id')
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
                    complete: data,
                    fevBarber: fevBarberArray
                  }
                });
              }
            })
        }
      })
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
  var page = parseInt(req.body.page) || 1;
  var count = parseInt(req.body.count) || 10;
  var skipNo = (page - 1) * count;
  var query = {};
  query.user_type = "customer"
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
      first_name: {
        "$toUpper": "$first_name"
      },
      last_name: {
        "$toUpper": "$last_name"
      },
      email: "$email",
      mobile_number: "$mobile_number",
      ratings: "$ratings",
      created_date: "$created_date",
      is_deleted: "$is_deleted",
      is_active: "$is_active",
      is_verified: "$is_verified",
      gallery: "$gallery",
      latLong: "$latLong",
      customer_rating: "$customer_rating",
      customer_numberof_cuts: "$customer_numberof_cuts",
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
          first_name: {
            "$toUpper": "$first_name"
          },
          last_name: {
            "$toUpper": "$last_name"
          },
          email: "$email",
          mobile_number: "$mobile_number",
          ratings: "$ratings",
          created_date: "$created_date",
          is_deleted: "$is_deleted",
          is_active: "$is_active",
          is_verified: "$is_verified",
          gallery: "$gallery",
          customer_rating: "$customer_rating",
          customer_numberof_cuts: "$customer_numberof_cuts",
          latLong: "$latLong",
          picture: "$picture"
        }
      }, {
        "$sort": sortquery
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

  checkReference({
    _id: req.body.appointment_id
  });

  if (req.body.is_favourite) {
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
      // This callback will upate the no. of ratings of the user and number of cuts
      console.log("user result callback");
      user.find({
        "ratings.rated_by": req.headers.user_id
      }, {
        "ratings.$": 1
      }).exec(function(cusRatingerr, customerRatingData) {
        console.log(JSON.stringify(customerRatingData));
        let totalsum = 0;
        for (var i = 0; i < customerRatingData.length; i++) {
          totalsum += customerRatingData[i].ratings[0].score;
        }
        console.log(totalsum);
        totalsum += parseInt(req.body.score);
        console.log(totalsum);
        let totalRating = totalsum / (customerRatingData.length + 1);
        console.log(totalRating);
        appointment.find({
          customer_id: req.headers.user_id,
          "appointment_status": "completed"
        }, function(err, data) {
          if (data.length) {
            let cuts = data.length;
            console.log("customer rating", totalRating);
            console.log("customer total cuts", cuts);
            user.update({
              _id: req.headers.user_id
            }, {
              $set: {
                customer_numberof_cuts: cuts,
                customer_rating: totalRating
              }
            }, function(err, result) {
              console.log("update user result", result);
              if (err) {
                console.log("rate user error", err)
              } else {
                done(err, result);
              }
            })
          } else {
            user.update({
              _id: req.headers.user_id
            }, {
              $set: {
                customer_numberof_cuts: 1,
                customer_rating: totalRating
              }
            }, function(err, result) {
              if (err) {
                console.log("rate user error", err)
              } else {
                done(err, result);
              }
            })
          }
        })
      })
    },
    function(status, done) {
      // This callback will update the barber, no of ratings and no of cuts
      user.find({
        _id: req.body.barber_id,
        "ratings.rated_by": req.body.barber_id
      }, {
        "ratings.$": 1
      }).exec(function(cusRatingerr, customerRatingData) {
        console.log("barber result", JSON.stringify(customerRatingData));
        let totalsum = 0;
        for (var i = 0; i < customerRatingData.length; i++) {
          totalsum += customerRatingData[i].ratings[0].score;
        }
        console.log(totalsum);
        totalsum += parseInt(req.body.score);
        console.log(totalsum);
        let totalRating = totalsum / (customerRatingData.length + 1);
        console.log(totalRating);
        appointment.find({
          barber_id: req.body.barber_id,
          "appointment_status": "completed"
        }, function(err, data) {
          if (data.length) {
            let cuts = data.length;
            console.log("customer rating", totalRating);
            console.log("customer total cuts", cuts);
            user.update({
              _id: req.body.barber_id
            }, {
              $set: {
                barber_numberof_cuts: cuts,
                barber_rating: totalRating
              }
            }, function(err, result) {
              console.log("update user result", result);
              if (err) {
                console.log("rate user error", err)
              } else {
                done(err, result);
              }
            })
          } else {
            user.update({
              _id: req.body.barber_id
            }, {
              $set: {
                barber_numberof_cuts: 1,
                barber_rating: totalRating
              }
            }, function(err, result) {
              if (err) {
                console.log("rate user error", err)
              } else {
                done(err, result);
              }
            })
          }
        })
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
            msg: "Rated successfully."
          });
          done(err);
        }
      })
    }
  ])
}

let checkReference = function(objFind) {
  console.log("checkReference pass obj\n\n\n", objFind);
  appointment.findOne(objFind, function(err, appResult) {
    console.log("find result\n\n", appResult)
    async.waterfall([
      function(done) {
        // this will used to get barber profile
        user.findOne({
          _id: appResult.barber_id
        }, function(err, barberData) {
          // console.log("bar_profi",barberData);
          done(null, result, barberData);
        })
      },
      function(barber_profile, done) {
        console.log("result in fourth callback", barber_profile);
        /*
        __________________________
        This callback will check all scenarios of Barber referral 
        __________________________
        */
        referal.find({
          "is_refer_code_used": false,
          "$or": [{
            referee_phone_number: barber_profile.mobile_number
          }, {
            referee_email: barber_profile.email
          }]
        }).sort({
          created_date: 1
        }).exec(function(refErr, refResult) {
          console.log("if barber reference ", refErr, refResult);
          if (refResult) {
            if (refResult.length > 0) {
              appointment.find({
                customer_id: barber_profile._id,
                appointment_status: "completed"
              }, function(apointErr, apointEesult) {
                console.log("Total appointment of barber", apointEesult.length)
                if (apointEesult.length == 1) {
                  console.log("first appointment of the barber");
                  async.waterfall([
                    function(done) {
                      referal.update({
                        _id: refResult[0]._id
                      }, {
                        $set: {
                          is_refer_code_used: true
                        }
                      }).exec(function(err, data) {
                        console.log("update status of referal", data)
                      })
                    },
                    function(done) {
                      referal.find({
                        referral: refResult[0].referral
                      }, function(err, refCountResult) {
                        if (refCountResult.length % 10 == 0) {
                          // mail sent to the admin for the amazon gift card
                          done(null);
                        } else {
                          done(null);
                        }
                      })
                    }
                  ])
                } else {
                  done(null);
                }
              })
            } else {
              done(null);
            }
          }
        })
      }
    ])
  })
}

let updateRefferalDb = function(updateData) {
  referal.update(updateData, {
    $set: {
      is_refer_code_used: true
    }
  }, function(upErr, upErresult) {
    if (upErr) {

    } else {
      commonObj.sendMail("to", "from", "subject", "text", function(err, result) {
        if (err) {
          console.log("errr in male");
        } else {
          console.log("mail sent")
        }
      })
    }
  })
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
  console.log("device_type", req.headers.device_type)
  user.findOne({
    _id: req.headers.user_id
  }, function(userErr, userData) {
    var device_type = req.headers.device_type.toLowerCase();
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
      if (req.body.invite_as == 'customer') {
        text = fs.readFileSync(path.join(__dirname + './../email-template/CustomerEmailInvite.html'), 'utf-8');

      }
      if (req.body.invite_as == 'barber') {
        text = fs.readFileSync(path.join(__dirname + './../email-template/BarberEmailInvite.html'), 'utf-8');
      }
      text = text.replace("{{username}}", userData.first_name + " " + userData.last_name);
      let imgUrl = "";
      if (userData.picture) {
        imgUrl = "http://" + req.headers.host + "/" + "uploadedFiles/" + userData.picture
      } else {
        imgUrl = "https://www.filepicker.io/api/file/OqRXT4JuRbmXSgbxccgK"
      }
      text = text.replace("{{userimage}}", imgUrl);
      if (device_type == 'ios') {
        // text = constantObj.appleUrl.url;
      }
      if (device_type == 'android') {
        // text = constantObj.androidUrl.url;
      }

      let saveObj = req.body;
      saveObj.referral = req.headers.user_id;

      referal.find(saveObj, function(findErr, findResult) {
        console.log("findResult length", findResult);
        if (findResult.length > 0) {
          return res.status(400).send({
            msg: "You already refer this person. Please try again with another email."
          });
        } else {
          commonObj.sentMailTempalte(req.body.referee_email, from, subject, text, function(err, result) {
            console.log("mail in referapp", err, result)
            if (err) {
              return res.status(400).send({
                msg: "Error in sending mail"
              });
            } else {
              saveRefferApp(req, res);
            }
          })
        }
      })
    } else if (req.body.referee_phone_number) {
      let text = "";
      if (req.body.invite_as == 'customer') {
        text = constantObj.textToCustomers.text + "\n " + "iOS: " + constantObj.appleUrl.url + "\n " + "Android: " + constantObj.androidUrl.url;
      }
      if (req.body.invite_as == 'barber') {
        text = constantObj.textToBarbers.text + "\n " + "iOS: " + constantObj.appleUrl.url + "\n " + "Android: " + constantObj.androidUrl.url;
      }

      let saveObj = req.body;
      saveObj.referral = req.headers.user_id;

      referal.find(saveObj, function(findErr, findResult) {
        console.log("findResult length", findResult);
        if (findResult.length > 0) {
          return res.status(400).send({
            msg: "You already refer this person. Please try again with another email."
          });
        } else {
          commonObj.sentMessage(text, req.body.referee_phone_number, function(err, result) {
            console.log("twilio in referapp", err, result)
            if (result) {
              saveRefferApp(req, res);
            }
          })
        }
      })
    } else {
      return res.status(400).send({
        msg: "Please specify how you want to sent referral code."
      });
    }
  })
}

let saveRefferApp = function(req, res) {
  let saveObj = req.body;
  saveObj.referral = req.headers.user_id;
  referal(saveObj).save(function(err, result) {
    if (err) {
      return res.status(400).send({
        msg: constantObj.messages.errorInSave,
        err: err
      });
    } else {
      return res.status(200).send({
        msg: "You successfully refer the app."
      });
    }
  })
}
exports.allappointment = function(req, res) {
  console.log("req.query", req.query);
  var page = parseInt(req.body.page) || 1;
  var count = parseInt(req.body.count) || 100;
  var skipNo = (page - 1) * count;
  var query = {};
  query.is_deleted = false;
  var searchStr = ""
  console.log("skipNo", skipNo);
  console.log("count", count);
  if (req.body.applyFilter) {
    query.appointment_status = req.body.applyFilter
  }
  if (req.body.search) {
    searchStr = req.body.search;
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
  var sortkey = null;
  for (key in req.body.sort) {
    sortkey = key;
  }
  var sortquery = {};
  if (sortkey) {
    sortquery[sortkey ? sortkey : '_id'] = req.body.sort ? (req.body.sort[sortkey] == 'desc' ? -1 : 1) : -1;
  }
  console.log("query", JSON.stringify(query));
  console.log("sortquery", sortquery);

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
      is_deleted: "$is_deleted",
      appointment_date: "$appointment_date",
      totalPrice: "$totalPrice",
      created_date: "$created_date",
      services: "$services",
      request_cancel_on: "$request_cancel_on",
      request_check_in: "$request_check_in",
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
  }, {
    $match: query
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
          is_deleted: "$is_deleted",
          appointment_date: "$appointment_date",
          totalPrice: "$totalPrice",
          created_date: "$created_date",
          services: "$services",
          request_cancel_on: "$request_cancel_on",
          request_check_in: "$request_check_in",
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
      }, {
        $match: query
      }, {
        "$sort": sortquery
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
exports.countappoint = function(req, res) {
  let currentDate = moment().format("YYYY-MM-DD");
  let appointmentStartdate = moment(currentDate, "YYYY-MM-DD").format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z';
  var appointmentEnddate = moment(currentDate, "YYYY-MM-DD").add(1, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z';
  console.log("dates**********", appointmentStartdate, appointmentEnddate);

  async.parallel({
    one: function(parallelCb) {
      // This callback will get the total sale of barber
      appointment.find({
        appointment_date: {
          $gte: new Date(appointmentStartdate),
          $lt: new Date(appointmentEnddate)
        }
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    two: function(parallelCb) {
      // get barber total sales of current month
      appointment.find({
        appointment_status: "confirm",
        appointment_date: {
          $gte: new Date(appointmentStartdate),
          $lt: new Date(appointmentEnddate)
        }
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    three: function(parallelCb) {
      // get barber sale of current week
      appointment.find({
        appointment_status: "completed",
        appointment_date: {
          $gte: new Date(appointmentStartdate),
          $lt: new Date(appointmentEnddate)
        }
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    four: function(parallelCb) {
      appointment.find({
        appointment_status: "cancel",
        appointment_date: {
          $gte: new Date(appointmentStartdate),
          $lt: new Date(appointmentEnddate)
        }
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    five: function(parallelCb) {
      appointment.find({
        appointment_status: "decline",
        appointment_date: {
          $gte: new Date(appointmentStartdate),
          $lt: new Date(appointmentEnddate)
        }
      }, function(err, result) {
        parallelCb(null, result)
      });
    }
  }, function(err, results) {
    res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      data: {
        "totalAppoint": results.one.length,
        "confirmAppoint": results.two.length,
        "completedAppoint": results.three.length,
        "cancelAppoint": results.four.length,
        "declineAppoint": results.five.length
      }
    })
  });
}


exports.appointmentcount = function(req, res) {
  async.parallel({
    one: function(parallelCb) {
      appointment.find({
        appointment_status: "completed"
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    two: function(parallelCb) {
      appointment.find({
        appointment_status: "cancel"
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    three: function(parallelCb) {
      appointment.find({
        appointment_status: "confirm",
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    four: function(parallelCb) {
      appointment.find({
        appointment_status: "decline"
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
  }, function(err, results) {
    res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      data: {
        "totalCompleted": results.one.length,
        "totalCancel": results.two.length,
        "totalConfirm": results.three.length,
        "totalDecline": results.four.length
      }
    })
  });
}

exports.currentAppointment = function(req, res) {
  console.log("req.params", req.params);
  appointment.findOne({
    _id: req.params._id
  }).populate('barber_id', 'first_name last_name').populate('customer_id', 'first_name last_name').populate('cancel_by_user_id', 'first_name last_name').populate('shop_id', 'name address city state').exec(function(err, data) {
    if (err) {
      res.status(400).send({
        "msg": constantObj.messages.errorRetreivingData,
        "err": err
      })
    } else {
      console.log(data);
      user.findOne({
        _id: data.barber_id._id,
        "ratings.appointment_id": data._id
      }, {
        "ratings.$": 1
      }, function(err, ratingData) {
        if (ratingData) {
          res.status(200).send({
            "msg": constantObj.messages.successRetreivingData,
            "data": data,
            "rating": ratingData.ratings[0].score
          })
        } else {
          res.status(200).send({
            "msg": constantObj.messages.successRetreivingData,
            "data": data,
            "rating": "No rating."
          })
        }
      })
    }
  })
}