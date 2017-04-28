var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userTypeSchema = new mongoose.Schema({
  name :String,
  isDeleted:{
		type:Boolean,
		default:false
  }
});

var userType = mongoose.model('user_types', userTypeSchema);

module.exports = userType;