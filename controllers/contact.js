var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
let constantObj = require('./../constants.js');
let user = require('../models/User');
/**
 * GET /contact
 */
exports.contactGet = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 */
exports.contactBarbrDo = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('message', 'Message cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
 let auth = {
    auth: {
      api_key: process.env.MAILGUN_APIKEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }
  let nodemailerMailgun = nodemailer.createTransport(mg(auth));

  var mailOptions = {
    from: req.body.name + ' ' + '<' + req.body.email + '>',
    to: constantObj.messages.email,
    subject: '✔ Contact Form',
    text: req.body.message
  };

  nodemailerMailgun.sendMail(mailOptions, function(err) {
    return res.status(200).send({
      msg: constantObj.messages.emailsend
    });
  });
};


/**
 * POST /contact
 */
exports.contactShop = function (req, res) {
    console.log(req.body);
    console.log(req.headers);
    
    req.assert('to_user_id', 'Shop_id cannot be blank').notEmpty();
    req.assert('to_shop_name', 'Shop name cannot be blank').notEmpty();
    req.assert('from_name', 'Barber name cannot be blank').notEmpty();
    req.assert('from_email', 'from_email cannot be blank').notEmpty();
    req.assert('from_email', 'from_email is not valid').isEmail();
    req.assert('message', 'Message cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({
        remove_dots: false
    });
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send({
            msg: "error in your request",
            err: errors
        });
    }
    
    let from_name = req.body.from_name;
    let from_email = req.body.from_email;
    let to_user_id = req.body.to_user_id;
    let to_shop_name = req.body.to_shop_name;
    let message = req.body.message;
    
    user.findOne({
        _id:to_user_id
    }).exec(function(err,shopData){
        console.log(shopData)
        if(err){
            return res.status(400).send({
                msg: constantObj.messages.errorRetreivingData
            })
        } else {
            let auth = {
                auth: {
                    api_key: process.env.MAILGUN_APIKEY,
                    domain: process.env.MAILGUN_DOMAIN
                }
            }
            let nodemailerMailgun = nodemailer.createTransport(mg(auth));

            var mailOptions = {
                from: from_name + '<' + from_email + '>',
                to: shopData.first_name+' '+shopData.last_name + '<' + shopData.email + '>',
                subject: '✔ Barber wants to say something!',
                text: 'Dear '+to_shop_name +' '+ message
            };

            nodemailerMailgun.sendMail(mailOptions, function (err) {
                console.log(err);
                return res.status(200).send({
                    msg: constantObj.messages.emailsend
                });
            });
        }
    }) 
};