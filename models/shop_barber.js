let crypto = require('crypto');
let bcrypt = require('bcrypt-nodejs');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let shopBarbarSchema = new mongoose.Schema({
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


let shopbarber = mongoose.model('shopbarber', shopBarbarSchema);

module.exports = shopbarber;
