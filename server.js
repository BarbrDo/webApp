var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var multer  = require('multer');
var objectID = require('mongodb').ObjectID

/* Swagger Configuration */
const swaggerUi      = require('swagger-ui-express');
const swaggerJSDoc   = require('swagger-jsdoc');

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
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');

var app = express();


mongoose.connect('mongodb://localhost/barberdo');
// mongoose.connect('mongodb://barbrdo:barbrdo2780@127.0.0.1:27017/barbrdo',{auth:{authdb:"barbrdo"}});
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* server configuration */
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '3000';
var defaultUrl = '';
if(  host == 'localhost' && port == '3000'){
    var defaultUrl = host+':'+port;
}else{
    var defaultUrl = 'barbrdo.com';    
}
/* swagger Configuration. */
var swaggerDefinition = {
    info: { // API informations (required)
        title: 'eFarmX API Documentation', // Title (required)
        version: '0.0.0', // Version (required)
        description: 'API Documentation', // Description (optional)
    },
    host:  defaultUrl, // Host (optional)
    basePath: '/api', // Base path (optional)
};

// Options for the swagger docs
var options = {
    // Import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // Path to the API docs
    apis: ['./routes/*.js'],
};

var swaggerSpec = swaggerJSDoc(options);

app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



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
