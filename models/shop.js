var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var shopSchema = new mongoose.Schema({
  shop_id : {
     type:Schema.Types.ObjectId,
     ref:'users'
  },
  address: String,
  latLong: {
    type: [Number],
    index: '2dsphere'
  },
  picture: String,
  chairs:[{
     name:String,
     chair_image:String,
     shop_fair_percentage:Number,
     barber_fair_percentage:Number 
    },
    creation_date: {
      type: Date,
      default: Date.now()
    }]
}, schemaOptions);

shopSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

shopSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    cb(err, isMatch);
  });
};

shopSchema.virtual('gravatar').get(function() {
  if (!this.get('email')) {
    return 'https://gravatar.com/avatar/?s=200&d=retro';
  }
  var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
});

shopSchema.options.toJSON = {
  transform: function(doc, ret, options) {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
  }
};

var Shop = mongoose.model('shop', userSchema);

module.exports = Shop;
