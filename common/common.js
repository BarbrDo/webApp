let userObj = require('./../models/User.js');
let FCM = require('fcm-node');
let apn = require("apn");
let path = require('path');
var serverKey = 'AAAAXv0xbO0:APA91bGdjxu511QMarkeOKiy5Mb3w9D0ZkQ8uhNqZoUfocq6FzwEz-n13vXRAHf-t8HUB4h_gerPSmIfhROmchg5MHYNWTp615VivApc07MZprNYUd87Zmi9zDBd4THOxQM9pAbF7NGo';
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
// console.log("in common",process.env.MAILGUN_DOMAIN);
exports.sendMail = function(to, from, subject, text, cb) {
  console.log("to",to);
  console.log("from",from);
  console.log("subject",subject);
  console.log("text",text);
  try{
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
       console.log("mail error",err);
      cb(err, null);
    } else {
      console.log("mail sent",info);
      cb(null, info);
    }
  });
  }
  catch(e){
    console.log("catch",e);
  }
}
exports.notify = function(to_user_id, from_user_id, text, type,sentData, cb) {
  console.log("notify",to_user_id, from_user_id, text, type,sentData);
  userObj.findOne({
    _id: to_user_id
  }, function(err, result) {
    userObj.findOne({
      _id: from_user_id
    }, function(err, data) {
      if (result && data) {
        console.log("type..............",type);
        console.log("device type is",result.device_type);
        let id = "";
        if(sentData){
          let mydata = JSON.parse(JSON.stringify(sentData))
          mydata.shop_lat_long = result.barber_shops_latLong;
          mydata.customer_lat_long = data.latLong
          id = mydata
        }
        if (result.device_type === 'ios') {

          console.log("inside ios",id);
          console.log("device token",result.device_id)
          let apnProvider = new apn.Provider(options);
          let deviceToken = result.device_id;
          let note = new apn.Notification();
          note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
          note.badge = 0;
          note.sound = "ping.aiff";
          note.alert = data.first_name + " "+data.last_name+" "+ text;
          note.payload = {
            'messageFrom': type,
            'message':id
          };
          note.topic = "com.development.BarbrDo";
          note.notifyType = id
          note.message = id
          apnProvider.send(note, deviceToken).then((result) => {
            if (result.failed.length > 0) {
              console.log("error in sending notification",JSON.stringify(result));
              cb(err, null);
            } else {
              console.log("success in sending notification ios",result);
              cb(null, result);
            }
          });

        } else if (result.device_type == 'android') {
          var message = {
            to: result.device_id,
            // collapse_key: 'your_collapse_key',
            // notification: {
            //   title: text,
            //   body: ""
            // },
            data: { //you can send only notification or only data(or include both)
              my_key: type,
              my_another_key: data.first_name + " "+data.last_name+" "+ text,
              message:id
            }
          };

          fcm.send(message, function(err, response) {
            if (err) {
              cb(err, null);
              console.log("Something has gone wrong!");
            } else {
              console.log("success in sending notification android");
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

let accountSid = process.env.TWILIO_ACCOUNTSID; // Your Account SID from www.twilio.com/console
let authToken = process.env.TWILIO_AUTHTOKEN; // Your Auth Token from www.twilio.com/console

let twilio = require('twilio');
let client = new twilio(accountSid, authToken);

exports.sentMessage = function(text,to,cb) {
  console.log("inside sentMessage",text,to);
  client.messages.create({
    body: text, to: to, // Text this number
    from: '646798-2288' // From a valid Twilio number
  },function (err,result) {
    console.log("twilio",err,result)
    if(err){
      cb(err,null);
    }
    else{
      cb(null, result);
    }
  })
}
