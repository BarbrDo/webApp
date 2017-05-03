var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var db = require('./db.js');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var multer  = require('multer');
var objectID = require('mongodb').ObjectID


  var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploadedFiles/')
    },
    filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.substr(file.originalname.lastIndexOf("."),file.originalname.length))
   }
})
var upload = multer({ storage: storage })

// Load environment variables from .env file
dotenv.load();

// Models
var User = require('./models/User');

// Controllers
let userController = require('./controllers/user');
let contactController = require('./controllers/contact');
let customerController = require('./controllers/customer');
let shopController = require('./controllers/shop');
let chairRequestController = require('./controllers/chair_request');
let appointmentController = require('./controllers/appointment');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      return false;
    }
  };

  if (req.isAuthenticated()) {
    var payload = req.isAuthenticated();
    User.findById(payload.sub, function(err, user) {
      req.user = user;
      next();
    });
  } else {
    next();
  }
});

app.post('/contact', contactController.contactPost);
app.post('/api/v1/account', userController.ensureAuthenticated, userController.accountPut);
app.delete('/api/v1/account', userController.ensureAuthenticated, userController.accountDelete);
app.post('/api/v1/addChair',userController.addChair)
app.post('/api/v1/removeChair', userController.removeChair);
app.post('/api/v1/signup', userController.signupPost);
app.post('/api/v1/login', userController.loginPost);
app.get('/api/v1/shops', customerController.allShops);
app.post('/api/v1/takeAppointment', appointmentController.takeAppointment);
app.post('/api/v1/requestChair', chairRequestController.requestChair);
app.post('/api/v1/bookChair', chairRequestController.bookChair);
app.post('/api/v1/shops',upload.any() ,shopController.editShop);
app.get('/api/v1/getUserType', userController.getUserType);
app.post('/api/v1/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.post('/auth/facebook', userController.authFacebook);
app.get('/auth/facebook/callback', userController.authFacebookCallback);
app.post('/auth/google', userController.authGoogle);
app.get('/auth/google/callback', userController.authGoogleCallback);

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
