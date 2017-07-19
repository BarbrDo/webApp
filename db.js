var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/barberdo');
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
