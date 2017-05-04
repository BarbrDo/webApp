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

var objectID = require('mongodb').ObjectID




// Load environment variables from .env file
dotenv.load();

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Swagger Configuration */
var swaggerUi = require('swagger-ui-express');
var swaggerJSDoc = require('swagger-jsdoc');
var defaultUrl = process.env.HOST + ':' + process.env.PORT;
console.log(defaultUrl);
var swaggerDefinition = {
    info: {
        title: 'BarbrDo API Documentation',
        version: '1.0.0',
        description: 'API Documentation',
    },
    host: defaultUrl, 
    basePath: '/api/v1',
};
// Options for the swagger docs
var options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./routes/*.js'],
};
var swaggerSpec = swaggerJSDoc(options);
app.get('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

require('./routes/routes')(app, express);
// app.use(function (req, res, next) {
//     req.isAuthenticated = function () {
//         var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
//         try {
//             return jwt.verify(token, process.env.TOKEN_SECRET);
//         } catch (err) {
//             return false;
//         }
//     };

//     if (req.isAuthenticated()) {
//         var payload = req.isAuthenticated();
//         User.findById(payload.sub, function (err, user) {
//             req.user = user;
//             next();
//         });
//     } else {
//         next();
//     }
// });

app.get('*', function (req, res) {
    res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.sendStatus(err.status || 500);
    });
}

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
