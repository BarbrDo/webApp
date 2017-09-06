let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let shopSchema = new mongoose.Schema({
    owner_first_name:{
        type:String
    },
    owner_last_name:{
        type:String
    },
    owner_mobile_number:{
        type:Number
    },
    license_number:{
        type:String
    },
    owner_email:{
        type:String
    },
    name: String,
    address: String,
    formatted_address:String,
    city: String,
    state: String,
    zip: String,
    latLong: {
        type: [Number], // longitude first and latitude after
        index: '2dsphere'
    },
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    }
});


let Shop = mongoose.model('shops', shopSchema);

module.exports = Shop;
