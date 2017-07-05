var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var chairBookingSchema = new mongoose.Schema({
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    chair_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    chair_type: {
        type: String
    },
    barber_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    amount: Number,
    shop_percentage: Number,
    barber_percentage: Number,
    booking_date: {
        type: Date,
        default: Date.now()
    },
    release_date: {
        type: Date
    },
    is_booking_active: {
        type: Boolean,
        default: false
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
var chairBooking = mongoose.model('chair_bookings', chairBookingSchema);
module.exports = chairBooking;