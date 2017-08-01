let userObj = require('./../models/user.js');
let FCM = require('fcm-node');
let apn = require("apn");
let path = require('path');
var serverKey = 'AIzaSyAxYVocgXGryOjwZ-7WIW4KB1fQtZ5tXFY';
var fcm = new FCM(serverKey);
let moment = require('moment');
let constantObj = require('./../constants.js');
let crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

let options;
options = {
  token: {
    key: path.resolve("./common/AuthKey_4MVSAKPE86.p8"),
    keyId: "4MVSAKPE86",
    teamId: "UKZ733R4T6"
  },
  production: false
};
let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');

exports.sendMail = function(to, from, subject, text, cb) {
  let auth = {
    auth: {
      api_key: process.env.MAILGUN_APIKEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }
  let nodemailerMailgun = nodemailer.createTransport(mg(auth));

  let mailOptions = {
    to: to,
    from: from,
    subject: subject,
    text: text
  };

  nodemailerMailgun.sendMail(mailOptions, function(err, info) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, info);
    }
  });
}
exports.notify = function(to_user_id, from_user_id, text, type, cb) {
  userObj.findOne({
    _id: to_user_id
  }, function(err, result) {
    userObj.findOne({
      _id: from_user_id
    }, function(err, data) {
      if (result) {
        console.log(result.device_type);
        if (result.device_type === 'ios') {
          console.log("inside ios");
          let apnProvider = new apn.Provider(options);
          let deviceToken = result.device_id;
          let note = new apn.Notification();
          note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
          note.badge = 3;
          note.sound = "ping.aiff";
          note.alert = data.first_name + " "+data.last_name+" "+ text;
          note.payload = {
            'messageFrom': type
          };
          note.topic = "com.development.BarbrDo";
          note.notifyType = "matchNotification"
          apnProvider.send(note, deviceToken).then((result) => {
            if (result.failed.length > 0) {
              console.log("error in sending notification");
              cb(err, null);
            } else {
              console.log("success in sending notification");
              cb(null, result);
            }
          });

        } else if (result.device_type == 'android') {
          var message = {
            to: result.device_id,
            // collapse_key: 'your_collapse_key',
            notification: {
              title: text,
              body: text
            },
            data: { //you can send only notification or only data(or include both)
              my_key: type,
              my_another_key: text
            }
          };

          fcm.send(message, function(err, response) {
            if (err) {
              cb(err, null);
              console.log("Something has gone wrong!");
            } else {
              cb(null, result);
            }
          });
        }
      }
    })
  })
}

exports.encrypt = function(text) {

  let cipher = crypto.createCipher(algorithm, password)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

exports.decrypt = function(text) {
  let decipher = crypto.createDecipher(algorithm, password)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

exports.makeid = function() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.viewTimeSlots = function(req, res) {
  res.status(200).send({msg: constantObj.messages.successRetreivingData, data: constantObj.timeSlots});
}
exports.removeOffset = function(dobFormat) {
  let userOffset = new Date(dobFormat).getTimezoneOffset();
  let userOffsetMilli = userOffset * 60 * 1000;
  let dateInMilli = moment(dobFormat).unix() * 1000;
  let dateInUtc = dateInMilli - userOffsetMilli;
  return dateInUtc;
}
exports.addOffset = function(dobFormat) {
  let userOffset = new Date(dobFormat).getTimezoneOffset();
  let userOffsetMilli = userOffset * 60 * 1000;
  let dateInMilli = moment(dobFormat).unix() * 1000;
  let dateInUtc = dateInMilli + userOffsetMilli;
  return dateInUtc;
}

let accountSid = 'AC865177abe2f391adae3a6d528a87e4d7'; // Your Account SID from www.twilio.com/console
let authToken = '2eadab4ae69fe6583bbc54793208eea1'; // Your Auth Token from www.twilio.com/console

let twilio = require('twilio');
let client = new twilio(accountSid, authToken);

exports.sentMessage = function() {
  client.messages.create({
    body: 'Hello from Node', to: '+91 7696516981', // Text this number
    from: '+14157410903' // From a valid Twilio number
  }).then((message) => console.log(message.sid));
}
