let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};
let chairRequestSchema = new mongoose.Schema({
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
  amount: Number,
  shop_percentage: Number,
  barber_percentage: Number,
  barber_id: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  requested_by: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accept', 'decline']
  },
  booking_date: {
    type: Date
  },
  created_date: {
    type: Date,
    default: Date.now()
  }
}, schemaOptions);

let chairRequest = mongoose.model('chair_requests', chairRequestSchema);

module.exports = chairRequest;