let User = require('../models/User');
let constantObj = require('./../constants.js');
let stripeToken = process.env.STRIPE
let stripe = require('stripe')(stripeToken);
let AppointmentController = require('./appointment.js')

// let barberServices = require('./../controllers/barber');

exports.featuringPlans = function(req, res) {
  stripe.plans.list(
    /*{ limit: 3 },*/
    function(err, plans) {
      if (err) {
        res.status(400).send({
          msg: "Error occurred in retrieving plans.",
          "err": err
        });
      } else {
        res.status(200).send({
          msg: "Plans retrieve successfully.",
          "data": plans
        });
      }
    }
  );
}

exports.createCharges = function(token, price,user_id,cb) {
    let chargeAmount = price * 100;
    console.log(chargeAmount);
    User.findOne({
        _id: user_id
    }, function (err, data) {
        if (err) {
            res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                "err": err
            });
        } else {
            console.log(data);
            let email = data.email;
            if (data.stripe_customer.length > 0) {
                stripe.charges.create({
                    amount: chargeAmount,
                    currency: "usd",
                    capture: false,
                    customer: data.id
                }).then(function (charge) {
                    cb(null,charge);
                }).catch(function(err){
                    cb(err,null);
                });
            } else {
                stripe.customers.create({
                    email: email,
                    source: token
                }).then(function (customer) {
                    // YOUR CODE: Save the customer ID and other info in a database for later.
                    return stripe.charges.create({
                        amount: chargeAmount,
                        currency: "usd",
                        capture: false,
                        customer: customer.id
                    });
                }).then(function (charge) {
                    cb(null,charge);
                }).catch(function(err){
                     cb(err,null);
                });
            }
        }
    });
};

exports.createPlan = function(req, res) {
  req.assert('amount', 'Amount cannot be blank.').notEmpty();
  req.assert('interval', 'Interval cannot be blank.').notEmpty();
  req.assert('name', 'Name cannot be blank.').notEmpty();
  req.assert('id', 'Unique id cannot be blank.').notEmpty();
  req.assert('trial_period_days', 'trial_period_days cannot be blank.').notEmpty();
  req.assert('statement_descriptor', 'Name cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let currency = process.env.STRIPE_CURRENCY
  stripe.plans.create({
    id: req.body.id,
    amount: req.body.amount,
    interval: req.body.interval,
    name: req.body.name,
    currency: currency,
    statement_descriptor: req.body.statement_descriptor,
  }, function(err, plan) {
    if (err) {
      console.log(err);
      res.status(400).send({
        msg: "Error in creating stripe plan.",
        err: err
      });
    } else {
      console.log(plan);
      res.status(200).send({
        msg: "Plan create successfully.",
        data: plan
      });
    }
  });
}

exports.updatePlan = function(req, res) {
  req.assert('name', 'Name cannot be blank.').notEmpty();
  req.assert('id', 'Unique id cannot be blank.').notEmpty();
  req.assert('trial_period_days', 'trial_period_days cannot be blank.').notEmpty();
  req.assert('statement_descriptor', 'Name cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log(req.body);
  stripe.plans.update(req.body.id, {
    name: req.body.name,
    statement_descriptor: req.body.statement_descriptor,
    trial_period_days: req.body.trial_period_days,
  }, function(err, plan) {
    if (err) {
      console.log(err);
      res.status(400).send({
        msg: "Error in updating stripe plan.",
        err: err
      });
    } else {
      console.log(plan);
      res.status(200).send({
        msg: "Plan update successfully.",
        data: plan
      });
    }
  });
}
exports.deletePlan = function(req, res) {
  req.assert('id', 'Unique id cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log(req.body);
  stripe.plans.del(
    req.body.id,
    function(err, confirmation) {
      if (err) {
        console.log(err);
        res.status(400).send({
          msg: "Error in creating stripe plan.",
          err: err
        });
      } else {
        console.log(confirmation);
        res.status(200).send({
          msg: "Plan create successfully.",
          data: confirmation
        });
      }
    }
  )
}

// exports.getInformation = function (req,res) {
// 	let barberId = "595dde4472847e58cbbe490b"
// 	let startDate = "2017-07-07";
// 	let endDate = "2017-07-10"
// 	async.parallel({
//     one: function(parallelCb) {
//         barberFile.getBarber(barberId,function (err,result) {
//         	parallelCb(null,result)
//         });
//     },
//     two: function(parallelCb) {
//         barberFile.getBarberAppointmentsOnDates(barberId,startDate,endDate,function (err,result) {
//         	parallelCb(null,result)
//         });
//     },
//     three: function(parallelCb) {
//         barberFile.getBarberTotalSale(barberId,function (err,result) {
//         	parallelCb(null,result)
//         });
//     },
//     four: function(parallelCb) {
//         barberFile.getBarberTotalSaleOnDates(barberId,startDate,endDate,function (err,result) {
//         	parallelCb(null,result)
//         });
//     }
// }, function(err, results) {
//     // results will have the results of all 3
//     console.log("barberProfile",results.one);
//     console.log("Appointments between dates",results.two);
//     console.log("Total sale",results.three);
//     console.log("Total sale b/w dates",results.four);
// });
// }