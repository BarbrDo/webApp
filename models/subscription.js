var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var subScribeSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    stripe_information: [],
    stripe_subscribe: [],
    created_date: {
        type: Date,
        default: Date.now()
    },
    modified_date: {
        type: Date,
        default: Date.now()
    }
});
var Subscribe = mongoose.model('subscriptions', subScribeSchema);
module.exports = Subscribe;