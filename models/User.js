var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    salutation: String,
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
        enum:["customer","barber","shop"],
        require: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    randomString: String,
    gender: String,
    picture: String,
    facebook: String,
    google: String,
    device_type: String,
    device_id: String,
    latLong: {
        type: [Number], // longitude first and latitude after
        index: '2dsphere'
    },
    // payment_methods: [
    //     {
    //         method: String,
    //         card_type: String,
    //         is_primary: Boolean,
    //         card_id: String,
    //         first_name: String,
    //         last_name: String,
    //     }],
    ratings:[{
        rated_by:{
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        score:Number,
        comments:String,
        rated_by_name: String,
        appointment_date: {
            type: Date
        }
    }],
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
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    },
    last_login: Date,
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
    },
    is_email_marketing: Boolean,
    info_source: String,
});

userSchema.pre('save', function (next) {
    var user = this;
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
    var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
});

userSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
    }
};

var User = mongoose.model('users', userSchema);

module.exports = User;
