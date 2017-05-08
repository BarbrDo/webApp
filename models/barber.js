var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var barberSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    license_number: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    },
    subscription:[
        {
            
        }
    ],
    short_description:String,
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


var Barber = mongoose.model('barbers', barberSchema);

module.exports = Barber;