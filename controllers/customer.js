let user = require('../models/user');
let constantObj = require('./../constants.js');
let notification = require('../models/notification');
let appointment = require('../models/appointment');
let commonObj = require('../common/common');
let moment = require('moment');
let mongoose = require('mongoose');

exports.getNearbyBarbers = function(req, res) {
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.status(400).send({msg: "error in your request", err: errors});
  }
  let long = parseFloat(req.headers.device_longitude);
  let lati = parseFloat(req.headers.device_latitude);
  let maxDistanceToFind = constantObj.distance.shopDistance; // in miles in km 0.001
  user.aggregate([
    {
      $geoNear: {
        query: {
          "user_type": "barber",
          "is_active": true,
          "is_verified": true,
          "is_deleted": false,
          "is_online": true
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
      $unwind: "$barber_shops"
    }, {
      $match: {
        "barber_shops.is_default_shop": true
      }
    }, {
      $lookup: {
        from: 'shops',
        localField: 'barber_shops.shop_id',
        foreignField: '_id',
        as: 'shopInfo'
      }
    }, {
      $unwind: "$shopInfo"
    }, {
      $project: {
        _id: 1,
        first_name: 1,
        last_name: 1,
        email: 1,
        gallery: 1,
        ratings: 1,
        mobile_number: 1,
        barber_services: 1,
        barber_shops: {
          _id: "$shopInfo._id",
          name: "$shopInfo.name",
          latLong: "$shopInfo.latLong",
          is_default_shop: "$barber_shops.is_default_shop"
        }
      }
    }
  ]).exec(function(err, result) {
    if (err) {
      res.status(400).send({msg: constantObj.messages.errorRetreivingData, "err": err});
    } else {
      res.status(200).send({msg: 'Successfully updated fields.', "data": result});
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

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  let saveData = req.body;
  saveData.customer_id = req.headers.user_id;
  saveData.appointment_date = removeOffset(req.body.appointment_date);
  appointment(saveData).save(function(err, data) {
    if (err) {
      return res.status(400).send({msg: constantObj.messages.errorInSave});
    } else {
      callNotification("customer_request_to_barber", saveData.barber_id, saveData.customer_id)
      res.status(200).send({msg: constantObj.messages.saveSuccessfully})
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

exports.addFavouriteBarber = function(req, res) {
  req.assert("barber_id", "Barber id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
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
      return res.send(400, {"msg": "Error in adding services."});
    } else {
      res.status(200).send({"msg": "Favourite barber added."});
    }
  })
};

exports.allFavouriteBarbers = function(req, res) {
  req.checkParams("barber_id", "barber ID is required").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  var id = mongoose.Types.ObjectId(req.headers.user_id);
  user.aggregate([
    {
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
    }
  ]).exec(function(err, result) {
    if (err) {
      return res.status(400).send({msg: constantObj.messages.errorRetreivingData});
    } else {
      return res.status(200).send({msg: constantObj.messages.successRetreivingData, data: result});
    }
  })
}

exports.removeFavouriteBarber = function(req, res) {
  req.checkParams("_id", "Id required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  user.update({
    "_id": req.headers.user_id
  }, {
    $pull: {
      "favourite_barber": {
        "_id": req.params._id
      }
    }
  }).exec(function(err, result) {
    if (err) {
      res.status(400).send({msg: constantObj.messages.errorRetreivingData, "err": err});
    } else {
      res.status(200).send({msg: 'Successfully removed barber.'});
    }
  })
}

exports.sendMessageToBarber = function(req, res) {
  req.assert("barber_id", "Barber id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("text", "Text is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  callNotification(req.body.text, req.body.barber_id, req.body.user_id);
  res.status(200).send({msg: "You msg is successfully send."});
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