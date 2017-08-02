let express = require('express');
let path = require('path');
let logger = require('morgan');
let compression = require('compression');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let expressValidator = require('express-validator');
let dotenv = require('dotenv');
let db = require('./db.js');
let jwt = require('jsonwebtoken');
let moment = require('moment');
let request = require('request');
let objectID = require('mongodb').ObjectID
// Load environment vaiables from .env file
dotenv.load();

var cron = require('node-cron');
// var task = cron.schedule('* * * * *', function() {
//   console.log('will execute every minute until stopped');
// });

let app = express();
let engines = require('consolidate');
app.set('views', __dirname + '/public');
app.engine('html', engines.mustache);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');

/* Swagger Configuration */
let swaggerUi = require('swagger-ui-express');
let swaggerJSDoc = require('swagger-jsdoc');
let defaultUrl = process.env.HOST + ':' + process.env.PORT;
console.log(defaultUrl);

// Swagger
let swaggerDefinition = {
    info: {
        title: 'BarbrDo API Documentation',
        version: '2.0.0',
        description: 'API Documentation',
    },
    host: defaultUrl,
    basePath: '/api/v2',
};

let options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./routes/*.js'],
};
let swaggerSpec = swaggerJSDoc(options);
app.get('/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

require('./routes/routes')(app, express);
require('./routes/admin/routes')(app, express);
/*app.get('*', function (req, res) {
    res.redirect('/#' + req.originalUrl);
});*/
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
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
