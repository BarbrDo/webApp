let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let usStates = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    abbreviation: {
        type: String
    },
    is_deleted:{
        type: Boolean,
        default:false
    },
    is_active: {
        type: Boolean,
        default:true
    }
});

let states = mongoose.model('usstates', usStates);

module.exports = states;