let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let referalSchema = new mongoose.Schema({
    user_type: {
        type: String,
         enum: ["customer", "barber"],
        required: true
    },
    // referral is the person who is referring the unique code
    referral: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    // referee to whom we referring the unique code
    referee_email: {
        type: String,
    },
    referee_phone_number:{
        type:Number
    },
    created_date: {
        type: Date,
        default: Date.now()
    }
});

let referral = mongoose.model('refers', referalSchema);

module.exports = referral;