var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appointmentSchema = new mongoose.Schema({
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'shops',
        required: true
    },
    shop_name: String,
    barber_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    is_rating_given: {
        type: Boolean,
        default: false
    },
    barber_name: String,
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    customer_name: String,
    services: [],
    appointment_date: Date,
    appointment_status: {
        type: String,
        enum: ["pending", "confirm", "completed", "reschedule","cancel"],
        default: "pending"
    },
    tax_amount: Number,
    tax_percent: String,
    amount: String,
    currency_code: String,
    payment_method: {
        type: String,
        enum: ["cash", "card"]
    },
    card_lastfourdigit: Number,
    payment_status: {
        type: String,
        enum: ["pending", "confirm"],
        default: "pending"
    },
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    }
}, {strict: false});

var appointment = mongoose.model('appointments', appointmentSchema);

module.exports = appointment;