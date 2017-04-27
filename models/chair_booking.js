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
}, schemaOptions);

var chairRequest = mongoose.model('chair_requests', chairRequestSchema);

module.exports = chairRequest;