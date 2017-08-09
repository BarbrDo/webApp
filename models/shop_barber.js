var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shopBarbarSchema = new mongoose.Schema({
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'shops'
    },
    barber_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    is_default: {
        type: Boolean
    }
});


var shopbarber = mongoose.model('shopbarber', shopBarbarSchema);

module.exports = shopbarber;
