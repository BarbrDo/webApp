module.exports = function(app, express) {
    let router = express.Router();
    let User = require('../models/User');
    let jwt = require('jsonwebtoken');
    app.use(function(req, res, next) {
        req.isAuthenticated = function() {
            var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
            try {
                console.log("token", token);
                return jwt.verify(token, process.env.TOKEN_SECRET);
            } catch (err) {
                // throw err;
                return false;
            }
        };
        next();
        // if (req.isAuthenticated()) {
        //     var payload = req.isAuthenticated();
        //     User.findById(payload.sub, function (err, user) {
        //         req.user = user;
        //         next();
        //     });
        // } else {
        //     next();
        // }
    });
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/uploadedFiles/')
        },
        filename: function(req, file, cb) {
            cb(null, Date.now() + file.originalname.substr(file.originalname.lastIndexOf("."), file.originalname.length))
        }
    })
    var upload = multer({
        storage: storage
    })

    // Models
    // Controllers
    let userController = require('./../controllers/user');
    let contactController = require('./../controllers/contact');
    let customerController = require('./../controllers/customer');
    let shopController = require('./../controllers/shop');
    let chairRequestController = require('./../controllers/chair_request');
    let appointmentController = require('./../controllers/appointment');


/**
* @swagger
* info:
*   version: 1.0.0
*   title: BarbrDo
*   contact:
*      email: "ankushs@smartdatainc.net"
*   description: BardrDo API's
*   termsOfService: terms
*   license:
*     name: MIT
*     url: http://opensource.org/licenses/MIT
* host: "52.39.212.226:4062"
* basePath: "/api/v1"
* schemes:
* - "http"
* paths:
*   /signup:
*     post:
*       tags:
*       - "user"
*       summary: "Create user"
*       description: "This can only be done by the logged in user."
*       operationId: "createUser"
*       produces:
*       - "application/json"
*       parameters:
*       - in: "body"
*         name: "body"
*         description: "Created user object"
*         required: true
*         schema:
*           $ref: "#/definitions/User"
*       responses:
*         default:
*           description: "successful operation"
*   /login:
*     post:
*       tags:
*       - "user"
*       summary: "Login user"
*       description: "Login using email and password."
*       operationId: "loginUser"
*       produces:
*       - "application/json"
*       parameters:
*       - in: "body"
*         name: "body"
*         description: "Created user object"
*         required: true
*         schema:
*           $ref: "#/definitions/Userlogin"
*       responses:
*         200:
*           description: "successful operation"
*           schema:
*             type: "string"
*           headers:
*             X-Rate-Limit:
*               type: "integer"
*               format: "int32"
*               description: "calls per hour allowed by the user"
*             X-Expires-After:
*               type: "string"
*               format: "date-time"
*               description: "date in UTC when token expires"
*         400:
*           description: "Invalid username/password supplied"
*   /shops:
*     get:
*       tags:
*       - "shop"
*       summary: "Shops Listing"
*       description: "List all the shops based on radius search"
*       operationId: "shops"
*       produces:
*       - "application/json"
*       parameters:
*       - in: "header"
*         name: "device_latitude"
*         description: "Device latitude"
*         required: true
*         type: string
*         format: string
*         default: "30.538994"
*       - in: "header"
*         name: "device_longitude"
*         description: "Device Longitude"
*         required: true
*         type: string
*         format: string
*         default: "75.955033"
*       responses:
*         200:
*           description: "successful operation"
*           schema:
*             type: "string"
*           headers:
*             X-Rate-Limit:
*               type: "integer"
*               format: "int32"
*               description: "calls per hour allowed by the user"
*             X-Expires-After:
*               type: "string"
*               format: "date-time"
*               description: "date in UTC when token expires"
*         400:
*           description: "Invalid request"
*     put:
*       tags:
*       - "shop"
*       summary: "Shop Update"
*       description: "Update shop details"
*       operationId: "shopUpdate"
*       produces:
*       - "application/json"
*       parameters:
*       - in: "header"
*         name: "device_latitude"
*         description: "Device latitude"
*         required: true
*         type: string
*         format: string
*         default: "30.538994"
*       - in: "header"
*         name: "device_longitude"
*         description: "Device Longitude"
*         required: true
*         type: string
*         format: string
*         default: "75.955033"
*       - in: "header"
*         name: "user_id"
*         description: "Logged in user's id"
*         required: true
*         type: string
*         format: string
*         default: "59072e9a2fe2cb0f2cafa060"
*       - in: "body"
*         name: "body"
*         description: "Created shop object"
*         required: true
*         schema:
*           $ref: "#/definitions/Shop"
*       - in: "body"
*         name: "image"
*         description: "Upload shop image"
*         required: false
*         type: file
*       responses:
*         200:
*           description: "successful operation"
*           schema:
*             type: "string"
*           headers:
*             X-Rate-Limit:
*               type: "integer"
*               format: "int32"
*               description: "calls per hour allowed by the user"
*             X-Expires-After:
*               type: "string"
*               format: "date-time"
*               description: "date in UTC when token expires"
*         400:
*           description: "Invalid request"
* definitions:
*    User:
*     type: "object"
*     properties:
*       first_name:
*         type: "string"
*       last_name:
*         type: "string"
*       email:
*         type: "string"
*         default: "ankushs@smartdatainc.net"
*       password:
*         type: "string"
*       mobile_number:
*         type: "string"
*         default: "9876543210"
*    Userlogin:
*     type: "object"
*     properties:
*       email:
*         type: "string"
*         default: "ankushs@smartdatainc.net"
*       password:
*         type: "string"
*         default: "123456"
*    Shop:
*     type: "object"
*     properties:
*       _id:
*         type: "string"
*         default: "5901e07846c94a225018d5cc"
*       name:
*         type: "string"
*         default: "Pop's Barber Shop"
*       license_number:
*         type: "string"
*         default: "123456ABCDEF"
*       address:
*         type: "string"
*         default: "Street 123"
*       state:
*         type: "string"
*         default: "Punjab"
*       city:
*         type: "string"
*         default: "Mohali"
*       zip:
*         type: "string"
*         default: "160071"  
*       image:
*         type: "file"
*/
//Users
app.post('/api/v1/signup', userController.signupPost);
app.post('/api/v1/login', userController.loginPost);
app.post('/api/v1/forgot', userController.forgotPost);
app.post('/api/v1/account', userController.ensureAuthenticated, userController.accountPut);
app.delete('/api/v1/account', userController.ensureAuthenticated, userController.accountDelete);
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.post('/auth/facebook', userController.authFacebook);
app.get('/auth/facebook/callback', userController.authFacebookCallback);
app.post('/auth/google', userController.authGoogle);
app.get('/auth/google/callback', userController.authGoogleCallback);

//
app.post('/reset/:token', userController.resetPost);

//Shops
app.get('/api/v1/shops', customerController.allShops);
app.put('/api/v1/shops',upload.any() ,shopController.editShop);

app.post('/api/v1/addChair',userController.addChair)
app.post('/api/v1/removeChair', userController.removeChair);

app.post('/api/v1/takeAppointment', appointmentController.takeAppointment);
app.post('/api/v1/requestChair', chairRequestController.requestChair);
app.post('/api/v1/bookChair', chairRequestController.bookChair);

app.get('/api/v1/getUserType',userController.ensureAuthenticated, userController.getUserType);
app.post('/api/v1/customerAppointments',appointmentController.customerAppointments);


app.post('/contact', contactController.contactPost);
}
