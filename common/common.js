// let userObj = require('./../app/models/users/users.js');
let gcm = require('android-gcm');
let apn = require("apn");
let path = require('path');
let gcmObject = new gcm.AndroidGcm('AAAAo_5rgkA:APA91bGOkkX0yNhWIKv4bHZ-f-M5bIPTup2iFpbeW5L1AfXkIeXYLAI6NfRzX4QJQZT7yBeBO5XTrfRk0tKH_iT8XqOwOh6NvQE3HXLePttvtNnK4hffAZok2rtz4NyY385Ag22f5V25');
let moment = require('moment');
// let geocoder = require('geocoder');
let constantObj = require('./../constants.js');
let crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

let options;
let notification;

options = {
  token: {
    key: path.resolve("./common/AuthKey_4MVSAKPE86.p8"),
    cert: path.resolve('./common/Certificates_both.pem'),
    keyId: "4MVSAKPE86",
    teamId: "UKZ733R4T6"
  },
  production: true
};

let note = new apn.Notification();

// exports.pushRequest = function(body, headers, cb) {

//     console.log("req.body is pushRequest", body);
//     console.log("req.headers", headers);
//     if (headers.device_type == 'ios') {
//         pushSendToIOS(headers.device_token)
//     }
//     if (headers.device_type == 'Android') {
//         console.log("else part for android");
//         pushSendToAndroid(headers.device_token);
//     }
//     userObj.findOne({
//         _id: body.to
//     }, function(userErr, userDetail) {
//         if (userErr) {
//             res.jsonp({
//                 'status': 'faliure',
//                 'messageId': 401,
//                 'message': 'There is problem in sending push notification when getting source name',
//                 "userdata": userErr
//             });
//         } else {
//             console.log("userDetail", userDetail);
//             if (userDetail.device_type == 'ios') {
//                 pushSendToIOS(userDetail.device_token);
//                 cb(null, "Notification send.");
//             }
//             if (userDetail.device_type == 'android') {
//                 pushSendToAndroid(userDetail.device_token);
//                 cb(null, "Notification send.");
//             }
//         }
//     });
// }

exports.pushSendToIOS = function(token) {
    console.log("token here", token);
    let apnProvider = new apn.Provider(options);
    let deviceToken = token;
    let note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = "You have a new match.";
    note.payload = {
        'messageFrom': 'John Appleseed'
    };
    note.topic = "com.smartData.squad";
    note.notifyType = "matchNotification"
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("result is", JSON.stringify(result));
        if (result.failed.length > 0) {
            console.log("error in sending notification");
        } else {
            console.log("success in sending notification");
        }
    });
}


let pushSendToAndroid = function(androidToken) {
    let message = new gcm.Message({
        registration_ids: [androidToken],
        data: {
            key1: 'You have a new match.'
        }
    });
}

// gcmObject.send(message, function(err, response) {});

// }
// exports.getLatLon = function(zipcode) {
//     let result = {};
//     geocoder.geocode(zipcode, function(err, data) {
//         if (err) {
//             // return 0;
//             console.log('geolocation error : ' + err);
//         } else {

//             if (data.status == 'OK') {
//                 result.lat = data.results[0].geometry.location.lat;
//                 result.lng = data.results[0].geometry.location.lng;
//                 result.status = data.status;

//                 return result;
//                 //res.send(result);

//             } else {

//                 result.status = data.status;
//                 return result;
//                 //res.send(result);
//             }
//         }
//     });
// }

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
    res.status(200).send({
        msg: constantObj.messages.successRetreivingData,
        data: constantObj.timeSlots
    });
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
let authToken = '2eadab4ae69fe6583bbc54793208eea1';   // Your Auth Token from www.twilio.com/console

let twilio = require('twilio');
let client = new twilio(accountSid, authToken);

exports.sentMessage = function () {
client.messages.create({
    body: 'Hello from Node',
    to: '+91 7696516981',  // Text this number
    from: '+14157410903' // From a valid Twilio number
})
.then((message) => console.log(message.sid));
}