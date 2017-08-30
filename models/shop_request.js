let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let shop_request_schema = new mongoose.Schema({
    name: String,
    address: String,
    street_address:String,
    city: String,
    state: String,
    zip: String,
    request_by: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    latLong: {
        type: [Number]
    },
    is_accepted:{
        type:Boolean,
        default:false
    },
    is_deleted:{
        type:Boolean,
        default:false
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


let shop_request = mongoose.model('shoprequests', shop_request_schema);

module.exports = shop_request;
