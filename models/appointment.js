let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let appointmentSchema = new mongoose.Schema({
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
        enum: ["decline", "confirm", "completed","cancel"],
        default: "decline"
    },
    cancel_by_user_id:{
          type: Schema.Types.ObjectId,
      },
    cancel_by_user_type:{
        type:String
    },
    services: [],
    next_in_chair:{
        type:Boolean
    },
    appointment_date: Date,
    totalPrice: Number,
    created_date: {
        type: Date,
        default: Date.now()
    }
});

let appointment = mongoose.model('appointments', appointmentSchema);

module.exports = appointment;
