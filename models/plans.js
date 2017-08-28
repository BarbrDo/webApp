let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let plansSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    duration: {
        // Duration must be in days
        type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    apple_id:{
        type:String,
        unique:true
    },
    google_id:{
       type:String,
        unique:true
    },
    created_date: {
        type: Date,
        default: Date.now()
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
});

let service = mongoose.model('plans', plansSchema);

module.exports = service;