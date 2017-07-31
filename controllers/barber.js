let user = require('../models/user');
let service = require('../models/service');
let constantObj = require('./../constants.js');
let async = require('async');
let notification = require('../models/notification');
let appointment = require('../models/appointment');

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

exports.showNearByBarbers = function(req, res) {
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
          "is_deleted": false
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
        from: "users",
        localField: "chairs.barber_id",
        foreignField: "_id",
        as: "barberInformation"
      }
    }, {
      $project: {
        barber_id: "$_id",
        first_name: "$first_name",
        last_name: "$last_name",
        ratings: "$ratings",
        distance: "$dist.calculated",
        units: {
          $literal: "miles"
        }
      }
    }
  ]).exec(function(err, result) {
    if (result) {
      console.log(JSON.stringify(result));
    }
  })
}

exports.customerRequestToBarber = function(req, res) {
  req.checkHeaders("user_id", "User Id cannot be blank").notEmpty();
  req.assert("barber_id", "Shop Id cannot be blank").notEmpty();
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
      res.status(200).send({})
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
/*
_______________________________________
Following function will cancel the request by barber and customer
_______________________________________
*/
exports.cancelAppointment = function() {
  req.checkParams("appointment_id", "Appointment id is required.").notEmpty();
  req.checkHeaders("user_type", "User type is required.").notEmpty();
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
              "cancel_by":req.headers.user_type
            }
          }, function(err, result) {
            if (err) {
              res.status(400).send({msg: constantObj.messages.errorRetreivingData, "err": err});
            } else {
              res.status(200).send({msg: 'Successfully updated fields.', "data": result});
            }
          })
        }
       else {
        res.status(400).send({msg: "No record found"});
      }
  }
})
};

exports.sendMessageToBarber = function (req,res) {
  req.assert("barber_id", "Barber id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("text","Text is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  callNotification(req.body.text, req.body.barber_id, req.body.user_id);
  res.status(200).send({
    msg:"You msg is successfully send."
  });
}
exports.sendMessageToCustomer = function (req,res) {
  req.assert("customer_id", "Barber id is required.").notEmpty();
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("text","Text is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  callNotification(req.body.text, req.body.customer_id, req.body.user_id);
  res.status(200).send({
    msg:"You msg is successfully send."
  });
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
          var updateUser = {
            key: "customer_create_appointment",
            text: name + " " + result.text
          };
          console.log(updateUser);
          user.update({
            _id: user_id
          }, {
            $push: {
              notification: updateUser
            }
          }).exec(function(err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(data);
            }
          })
        }
      })
    }
  })
}
