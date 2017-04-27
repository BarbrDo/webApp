var mongoose = require('mongoose');

var chairRequestSchema = new mongoose.Schema({
  shop_id: {
    type:Schema.Types.ObjectId,
    ref:'users'
  },
  chair_id:{
    type:Schema.Types.ObjectId,
     ref:'users'
   },
   barber_id:{
    type:Schema.Types.ObjectId,
    ref:'users'
   },
   status:{
    type:String,
    enum: ['pending', 'confirmed', 'declined']
   },
   booking_date:{
    type:Da
   },
   request_by:{
    type:String
   },
   created_date:{
    type:Date,
    default:Date.now()
   }
}, schemaOptions);

var chairRequest = mongoose.model('chair_requests', chairRequestSchema);

module.exports = chairRequest;