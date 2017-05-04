var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
        type: [Number], // longitude first and latitude after
        index: '2dsphere'
    },
    phone: Number,
    license_number: String,
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    },
    payment_methods: [
        {
            method: String,
            card_type: String,
            is_primary: Boolean,
            card_id: String,
            first_name: String,
            last_name: String,
            card_no: Number,
            status: Boolean,
            created_date: {
                type: Date,
                default: Date.now()
            },
            modified_date: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    ratings: [
        {
            rated_by: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            score: Number,
            comments: String
        }
    ],
    chairs: [
        {
            name: String,
            availability: {
                type: String,
                enum: ["booked", "available"]
            },
            type: {
                type: String,
                enum: ["weekly", "monthly", "percentage"]
            },
            amount: Number,
            shop_percentage: Number,
            barber_percentage: Number,
            booking_start: Date,
            booking_end: Date,
            barber_id: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            barber_name: String,
            isActive: {
                type: Boolean,
                default: true
            },
            created_date: {
                type: Date,
                default: Date.now()
            },
            modified_date: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    image: String,
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
    ]
});


var Shop = mongoose.model('shops', shopSchema);

module.exports = Shop;