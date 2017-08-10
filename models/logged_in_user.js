let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let loginUserSchema = new mongoose.Schema({
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

let loginUser = mongoose.model('loginUsers', loginUserSchema);

module.exports = loginUser;
