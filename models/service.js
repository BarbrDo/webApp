let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let serviceSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    is_optional:{
        type: Boolean,
    }
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    }
});

let service = mongoose.model('services', serviceSchema);

module.exports = service;