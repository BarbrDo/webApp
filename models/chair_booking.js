var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chairBookingSchema = new mongoose.Schema({
  shop_id: {
    type:Schema.Types.ObjectId,
    ref:'users'
  },
  chair_id:{
    type:Schema.Types.ObjectId,
     ref:'users'
   },
   booking_date:{
    type:Date,
    default:Date.now()
   },
   release_date:{
    type:Date
   },
   barber_id:{
    type:Schema.Types.ObjectId,
    ref:'users'
   },
   created_date:{
    type:Date,
    default:Date.now()
   },
   modified_date:{
     type: Date,
    default: Date.now()
   }
});

var chairBooking = mongoose.model('chair_bookings', chairBookingSchema);

module.exports = chairBooking;