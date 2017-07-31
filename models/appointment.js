var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appointmentSchema = new mongoose.Schema({
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'shops',
        required: true
    },
    barber_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    is_rating_given: {
        type: Boolean,
        default: false
    },
    rating_score:Number,
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    appointment_status: {
        type: String,
        enum: ["pending", "confirm", "completed", "reschedule","cancel"],
        default: "pending"
    },
    cancel_by:{
      type: Schema.Types.ObjectId,
    },
    services: [],
    appointment_date: Date,
    totalPrice: Number,
    created_date: {
        type: Date,
        default: Date.now()
    }
});

var appointment = mongoose.model('appointments', appointmentSchema);

module.exports = appointment;
