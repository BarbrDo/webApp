var mongoose = require('mongoose');
var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};
var userSchema = new mongoose.Schema({
  user_id:{
    type:Schema.Types.ObjectId,
     ref:'users'
    },
  first_name: String,
  last_name:String
  salutation: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  phone: Number,
  gender: String,
  location: String,
  picture: String,
  facebook: String,
  google: String,
  device_type: String,
  device_token: String,
  last_login: Date,
  is_email_marketing: Boolean,
  info_source: String,
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
  ratings:[{
    rated_by:{
      type:Schema.Types.ObjectId,
     ref:'users'
   },
   score:Number,
   comments:String,
  }],
  bookings:[{
    shop_id:{
     type:Schema.Types.ObjectId,
     ref:'users'
   },
   shop_name:String,
   barber_id:{
    type:Schema.Types.ObjectId,
     ref:'users'
   },
   barber_name:String,
   items:Array,
   booking_date:Date,
   appointment_date:Date,
   appointment_status:String,
   amount:Number,
   currency_code:String,
   payment_method:String,
   card_lastfourdigit:Number,
   payment_status:String
  }]
  typeOfUser: {
    type: String,
    required: [true, 'User type is required.'],
    enum: ['customer', 'barber', 'barberShop']
  },
  created: {
    type: Date,
    default: Date.now()
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, schemaOptions);

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    cb(err, isMatch);
  });
};

userSchema.virtual('gravatar').get(function() {
  if (!this.get('email')) {
    return 'https://gravatar.com/avatar/?s=200&d=retro';
  }
  var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
});

userSchema.options.toJSON = {
  transform: function(doc, ret, options) {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
  }
};

var User = mongoose.model('users', userSchema);

module.exports = User;