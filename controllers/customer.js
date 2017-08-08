let user = require('../models/user');
let constantObj = require('./../constants.js');
let notification = require('../models/notification');
let appointment = require('../models/appointment');
let commonObj = require('../common/common');
let moment = require('moment');
let mongoose = require('mongoose');
let geolib = require('geolib');

exports.getNearbyBarbers = function(req, res) {
  req.checkHeaders("user_id", "User ID is required").notEmpty();
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({msg: "error in your request", err: errors});
  }
  let long = parseFloat(req.headers.device_longitude);
  let lati = parseFloat(req.headers.device_latitude);
  let maxDistanceToFind = constantObj.distance.shopDistance; // in miles in km 0.001
  var id = mongoose.Types.ObjectId(req.headers.user_id);
  user.aggregate([
    {
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
    }
  ]).exec(function(err, result) {
    if (err) {
      res.status(400).send({msg: constantObj.messages.errorRetreivingData, "err": err});
    } else {
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
            _id:"$favBarbers._id",
            first_name: "$favBarbers.first_name",
            last_name: "$favBarbers.last_name",
            email: "$favBarbers.email",
            mobile_number: "$favBarbers.mobile_number",
            gallery: "$favBarbers.gallery",
            ratings: "$favBarbers.ratings",
            picture:"$favBarbers.picture",
            barber_services: "$favBarbers.barber_services",
            is_available: "$favBarbers.is_available",
            is_online: "$favBarbers.is_online",
            barber_shop_latLong: "$favBarbers.barber_shops_latLong",
            barber_shops: {
              $arrayElemAt: ["$shopInfo", 0]
            }
          }
        }
      ]).exec(function(err, favBarbers) {
        console.log("favBarbers",JSON.stringify(favBarbers));
        console.log("All barers",JSON.stringify(result));
        console.log("length of fav barber",favBarbers.length);
        console.log("length of all barber",result.length);
        let resultTantArray = [];
        if (favBarbers.length>0) {
          for (var i = 0; i < favBarbers.length; i++) {
            let k = 0;
            for (var j = 0; j < result.length; j++) {
              console.log("fav and all",favBarbers[i]._id,result[j]._id)
              if (favBarbers[i]._id.equals(result[j]._id)) {
                console.log("fav");
                let obj = result[j]
                obj.is_favourite = true;
                resultTantArray.push(obj)
                k = 1;
                break;
              } else {
                if(resultTantArray.includes(result[j])){

                }
                else{
                resultTantArray.push(result[j])
                }
              }
            }
            if (k == 0) {
              console.log("value of i",i);
              let abc = geolib.getDistance({
                latitude: lati,
                longitude: long
              }, {
                latitude: favBarbers[i].barber_shop_latLong[1],
                longitude: favBarbers[i].barber_shop_latLong[0]
              });
              abc = geolib.convertUnit('mi', abc, 2);
              let obj = favBarbers[i]
              obj.is_favourite = true;
              obj.distance = abc
              resultTantArray.push(obj)
            }
          }
          resultTantArray.sort(function(a,b) {return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);} );

          resultTantArray.sort(function(a,b) {return (a.is_favourite < b.is_favourite) ? 1 : ((b.is_favourite < a.is_favourite) ? -1 : 0);} );

          return res.status(200).send({msg: constantObj.messages.successRetreivingData, data: resultTantArray});
        } else {
          return res.status(200).send({msg: constantObj.messages.successRetreivingData, data: result});
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
      console.log("appointmentid ",data._id);
      callNotification("customer_request_to_barber", saveData.barber_id, saveData.customer_id,data._id)
      res.status(200).send({msg: constantObj.messages.saveSuccessfully,"data":data})
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
            cancel_by:[{
              user_id:req.headers.user_id,
              user_type:req.headers.user_type
            }]
          }
        }, function(err, result) {
          if (err) {
            res.status(400).send({msg: constantObj.messages.errorRetreivingData, "err": err});
          } else {
            res.status(200).send({msg: 'Successfully retrieve fields.', "data": result});
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
  req.checkHeaders("user_id", "User ID is required").notEmpty();
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
        _id:"$favBarbers._id",
        first_name: "$favBarbers.first_name",
        last_name: "$favBarbers.last_name",
        email: "$favBarbers.email",
        mobile_number: "$favBarbers.mobile_number",
        gallery: "$favBarbers.gallery",
        picture:"$favBarbers.picture",
        ratings: "$favBarbers.ratings",
        barber_services: "$favBarbers.barber_services",
        is_available: "$favBarbers.is_available",
        is_online: "$favBarbers.is_online",
        barber_shop_latLong: "$favBarbers.barber_shops_latLong",
        barber_shops: {
          $arrayElemAt: ["$shopInfo", 0]
        }
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
  req.checkParams("barber_id", "barber_id required.").notEmpty();
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
        "barber_id": req.params.barber_id
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
  (req.body.text, req.body.barber_id, req.body.user_id);
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

let callNotification = function(type, to_user_id, from_user_id,appointmentid) {
  notification.findOne({
    "type": type
  }, function(err, result) {
    console.log("result", result);
    if (result) {
      console.log("appointmentid",appointmentid);
      // passing arguments like to_user_id,from_user_id, and text
      commonObj.notify(to_user_id, from_user_id, result.text, type,appointmentid, function(err, data) {
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
    console.log("undel",req.params.cust_id);
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
    console.log("custdet",query._id)
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

    user.aggregate([{
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
exports.timeSlots = function (req,res) {
  res.status(200).send({
    "msg": constantObj.messages.successRetreivingData,
    "data": constantObj.offTimeSlots
  })
};
