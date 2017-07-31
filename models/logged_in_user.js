var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginUserSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    token:{
      type:String
    },
    created_date: {
        type: Date,
        default: Date.now()
    }
});

var loginUser = mongoose.model('loginUsers', loginUserSchema);

module.exports = loginUser;
