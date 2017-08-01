let user = require('../models/user');
let service = require('../models/service');
let constantObj = require('./../constants.js');
let async = require('async');
let notification = require('../models/notification');
let appointment = require('../models/appointment');
let commonObj = require('../common/common');

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
  if(req.body.status=='online' || req.body.status =='offline'){
    let status = (req.body.status=='online')?true:false
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
  }
  else{
    return res.status(400).send({msg: "Staus should be online and offline."});
  }
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

