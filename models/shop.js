var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};
var shopSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  name: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  latLong: {
    type: [Number],
    index: '2dsphere'
  },
  phone: Number,
  license_number: Number,
  create_date: {
    type: Date,
    default: Date.now()
  },
  modified_date: {
    type: Date,
    default: Date.now()
  },
  payment_methods: [{
    method: String,
    card_type: String,
    is_primary: Boolean,
    card_id: String,
    first_name: String,
    last_name: String,
    card_no: Number,
    status: Boolean,
    created: {
      type: Date,
      default: Date.now()
    },
    modified: {
      type: Date,
      default: Date.now()
    }
  }],
  ratings: [{
    rated_by: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    score: Number,
    comments: String
  }],
  chairs: [{
    name: String,
    // chair_image: String,
    shop_fair_percentage: Number,
    barber_fair_percentage: Number,
    availability: {
      type: String,
      enum: ["booked", "available"]
    },
    isActive:{
      type:Boolean,
      default:true
    },
    creation_date: {
      type: Date,
      default: Date.now()
    },
    modified_date: {
      type: Date,
      default: Date.now()
    }
  }],
  picture: String,
  gallery: [{
    name: {
      type: String
    },
    creationDate: {
      type: Date,
      default: Date.now()
    }
  }]
}, schemaOptions);


var Shop = mongoose.model('shop', shopSchema);

module.exports = Shop;