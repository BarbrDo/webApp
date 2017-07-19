var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
let constantObj = require('./../constants.js');
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
    res.send({
      msg: constantObj.messages.emailsend
    });
  });
};


/**
 * POST /contact
 */
exports.contactShop = function(req, res) {
    res.send({
      msg: 'Thank you! Your feedback has been submitted.'
    });
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
    to: 'barbrdoapp@gmail.com',
    subject: '✔ Contact Form',
    text: req.body.message
  };

  nodemailerMailgun.sendMail(mailOptions, function(err) {
    res.send({
      msg: 'Thank you! Your feedback has been submitted.'
    });
  });
};