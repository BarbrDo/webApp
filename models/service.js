var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var serviceSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
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

var service = mongoose.model('services', serviceSchema);

module.exports = service;