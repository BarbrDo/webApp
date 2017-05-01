var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/barberdo');
 // mongoose.connect('mongodb://barbrdo:barbrdo2780@127.0.0.1:27017/barbrdo',{auth:{authdb:"barbrdo"}});
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
