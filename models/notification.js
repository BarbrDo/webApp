let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let notificationSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true
    }
});

let notification = mongoose.model('notifications', notificationSchema);

module.exports = notification;
