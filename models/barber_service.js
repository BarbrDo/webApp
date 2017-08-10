let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let barberServicesSchema = new mongoose.Schema({
    barber_id: {
        type: Schema.Types.ObjectId,
        ref: 'barbers',
        required: true
    },
    service_id: {
        type: Schema.Types.ObjectId,
        ref: 'services',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price:{
        type:Number,
        required:true
    },
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
});


let barberServices = mongoose.model('barber_services', barberServicesSchema);

module.exports = barberServices;