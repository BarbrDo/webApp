var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true
    }
});

var notification = mongoose.model('notifications', notificationSchema);

module.exports = notification;
