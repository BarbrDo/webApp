var mongoose = require('mongoose');
var dotenv = require('dotenv');
dotenv.load();

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
