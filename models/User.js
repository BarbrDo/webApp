let crypto = require('crypto');
let bcrypt = require('bcrypt-nodejs');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        require: true,
    },
    last_name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        require: true,
    },
    password: {
        type: String
    },
    mobile_number: {
        type: String,
        require: true,
    },
    user_type: {
        type: String,
        enum: ["customer", "barber"],
        require: true,
    },
    radius_search: Number,
    password_reset_token: String,
    password_reset_expires: Date,
    random_string: String,
    picture: String,
    facebook: String,
    device_type: String,
    device_id: String,
    latLong: {
        type: [Number]
    },
    favourite_barber: [
        {
            barber_id: {
                type: Schema.Types.ObjectId,
                ref: 'shops'
            },
            created_date: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    barber_services: [
        {
            service_id: {
                type: Schema.Types.ObjectId,
                ref: 'services'
            },
            name: {
                type: String
            },
            price: {
                type: Number
            },
            created_date: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    barber_shops_latLong: {
        type:[Number],
        index: '2dsphere',
    },
    barber_shop_id:{
        type: Schema.Types.ObjectId,
        ref: 'shops'
    },
    bio: {
        type: String
    },
    ratings: [
        {
            rated_by: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            score: Number,
            appointment_id: {
              type: Schema.Types.ObjectId,
              ref: 'appointments'
            },
            appointment_date:{
                type:Date
            }
        }
    ],
    gallery: [
        {
            name: {
                type: String
            },
            created_date: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    license_number: {
        type: String
    },
    licensed_since: {
        type: Date,
        default: Date.now()
    },
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    },
    last_login: Date,
    is_online: {
        type: Boolean,
        default:false
    },
    is_available: {
        type: Boolean,
        default:false
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: false
    },
    remark: {
        type: String,
        default: "Your account is not verified yet."
    },
    
    subscribe: [
        {
            tranaction_response:[],
            plan_name:{
                type:String
            },
            start_date:{
                type:Date,
                required:true
            },
            end_date:{
                type:Date,
                required:true
            },
            price:{
                type:Number
            },
            pay_id:{
                type:String,
            },
            created_date:{
                type:Date,
                default:Date.now()
            }
        }
    ]
});

userSchema.pre('save', function (next) {
    let user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        cb(err, isMatch);
    });
};

userSchema.virtual('gravatar').get(function () {
    if (!this.get('email')) {
        return 'https://gravatar.com/avatar/?s=200&d=retro';
    }
    let md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
});

userSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
    }
};

let user = mongoose.model('users', userSchema);

module.exports = user;
