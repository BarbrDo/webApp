let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let shopSchema = new mongoose.Schema({
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
