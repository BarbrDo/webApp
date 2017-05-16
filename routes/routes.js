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
                return false;
            }
        };
        next();
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

    // Controllers
    let userController = require('./../controllers/user');
    let contactController = require('./../controllers/contact');
    // let customerController = require('./../controllers/customer');
    let shopController = require('./../controllers/shop');
    let chairRequestController = require('./../controllers/chair_request');
    let appointmentController = require('./../controllers/appointment');
    let barberServices = require('./../controllers/barber');
    let commonObj = require('./../common/common');
    //Users
    app.post('/api/v1/signup', userController.signupPost); //Signup
    app.post('/api/v1/login', userController.loginPost); // Login
    app.post('/api/v1/forgot', userController.forgotPost); //Forgot Password
    app.put('/api/v1/account',upload.any(), userController.accountPut); // Account update
    app.delete('/api/v1/account', userController.ensureAuthenticated, userController.accountDelete);
    app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
    app.post('/auth/facebook', userController.authFacebook);
    app.get('/auth/facebook/callback', userController.authFacebookCallback);
    app.post('/auth/google', userController.authGoogle);
    app.get('/auth/google/callback', userController.authGoogleCallback);
    app.post('/reset/:token', userController.resetPost);
    app.post('/api/v1/checkFaceBook', userController.checkFaceBook);

    //Shops
    app.get('/api/v1/shops', shopController.allShops); // List all shops and search shop
    app.put('/api/v1/shops', upload.any(), shopController.editShop); //Edit shop
    app.post('/api/v1/shops/chair', userController.addChair) //Add chair in shop
    app.get('/api/v1/shops/chair',shopController.allShopsHavingChairs);// It will show all shops having number of chairs
    app.delete('/api/v1/shops/chair', userController.removeChair); // Remove chair from shop
    app.post('/api/v1/shops/confirmchair', chairRequestController.bookChair);
    app.get('/api/v1/shops/barbers/:shop_id', shopController.shopContainsBarber);//show all barber related to shop
    
    //Customer
    app.get('/api/v1/appointment', appointmentController.customerAppointments); //View appointment
    app.post('/api/v1/appointment', appointmentController.takeAppointment); //Book Appointment
    app.post('/api/v1/customer/gallery', upload.any(), userController.uploadCustomerGallery); //Upload image in gallery
    app.delete('/api/v1/customer/gallery/:image_id',userController.deleteImages); //Delete image from gallery
    
    //Barber
    app.get('/api/v1/barbers', shopController.allBarbers); //Get all barbers
    app.get('/api/v1/barbers/:barber_id',barberServices.viewBarberProfile);//Get specific barber's detail
    app.post('/api/v1/barberServices', barberServices.addBarberServices); //Add new service in barber
    app.get('/api/v1/barberServices/:barber_id',barberServices.viewAllServiesOfBarber); // Get barber's services
    app.post('/api/v1/barber/requestchair', chairRequestController.requestChair); //Barber requesting chair to shop
    app.get('/api/v1/barber/appointments',barberServices.appointments);
    app.put('/api/v1/barber/confirmappointment/:appointment_id',barberServices.confirmAppointment);
    app.put('/api/v1/barber/rescheduleappointment/:appointment_id',barberServices.rescheduleAppointment);
    app.put('/api/v1/barber/completeappointment/:appointment_id',barberServices.completeAppointment);
    app.put('/api/v1/barber/cancelAppointment/:appointment_id', barberServices.cancelAppointment);
    app.post('/api/v1/barber/gallery',upload.any(), barberServices.uploadBarberGallery);//upload image in barber gallery
    //app.delete('/api/v1/barber/gallery/:image_id',barberServices.deleteImages); //Delete image from gallery

    //Common
    app.get('/api/v1/userprofile/:id', userController.getProfiles); //Get profile of customer / barber / shop
    app.get('/api/v1/getUserType', userController.ensureAuthenticated, userController.getUserType);
    app.post('/api/v1/contact', contactController.contactPost);
    app.get('/api/v1/timeslots',commonObj.viewTimeSlots)
}
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
 *       - in: "body"
 *         name: "body"
 *         description: "Created user object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/User"
 *       responses:
 *         200:
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
 *         400:
 *           description: "Invalid username/password supplied"
 *   /forgot:
 *     post:
 *       tags:
 *       - "user"
 *       summary: "Forgot Password"
 *       description: "Forgot Password"
 *       operationId: "forgotPassword"
 *       produces:
 *       - "application/json"
 *       parameters:
 *       - in: "body"
 *         name: "body"
 *         description: "Created user object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/forgotPassword"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid username/password supplied"
 *   /checkFaceBook:
 *     post:
 *       tags:
 *       - "user"
 *       summary: "Check Facebook user in DB"
 *       description: "Check if fb user exists in DB or not"
 *       operationId: "checkFBUser"
 *       produces:
 *       - "application/json"
 *       parameters:
 *       - in: "body"
 *         name: "body"
 *         description: "Send FB ID"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/facebookUser"
 *       responses:
 *         200:
 *           description: "successful operation"
 *   /account:
 *     put:
 *       tags:
 *       - "user"
 *       summary: "Update user profile and change password"
 *       description: "Update user profile and change password."
 *       operationId: "updateUser"
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
 *         default: "5909d7bca8af707ab3c1396c"
 *       - in: "body"
 *         name: "body"
 *         description: "Created user object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/User"
 *       responses:
 *         200:
 *           description: "successful operation"
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
 *       - in: "query"
 *         name: "search"
 *         description: "Search by Shop name"
 *         required: false
 *         type: string
 *         format: string
 *       responses:
 *         200:
 *           description: "successful operation"
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
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /shops/chair:
 *     post:
 *       tags:
 *       - "shop"
 *       summary: "Add chair"
 *       description: "Add chair to shop"
 *       operationId: "addChair"
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
 *         description: "Send shop id"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/addChair"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *     delete:
 *       tags:
 *       - "shop"
 *       summary: "Delete chair"
 *       description: "Delete chair from shop"
 *       operationId: "deleteChair"
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
 *         default: "590829938e6a4812ece58e76"
 *       - in: "body"
 *         name: "body"
 *         description: "Send shop id and chair id"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/deleteChair"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *     get:
 *       tags:
 *       - "shop"
 *       summary: "Barber can see shops having chairs"
 *       description: "Barber can see shops having chairs"
 *       operationId: "showShops"
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
 *         default: "590829938e6a4812ece58e76"
 *       - in: "query"
 *         name: "search"
 *         description: "Search by Shop name"
 *         required: false
 *         type: string
 *         format: string
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /shops/barbers/{shop_id}:
 *     get:
 *       tags:
 *       - "shop"
 *       summary: "Show all barbers related to shop"
 *       description: "Show all barber related to shop"
 *       operationId: "getshopbarber"
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
 *         default: "5901e07846c94a225018d5cc"
 *       - in: "path"
 *         name: "shop_id"
 *         description: "Shop ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5901e07846c94a225018d5cc"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"      
 *   /appointment:
 *     post:
 *       tags:
 *       - "customer"
 *       summary: "Create new appointment with barber"
 *       description: "Create new appointment with barber"
 *       operationId: "appointment"
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
 *         description: "Logged in user ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5909d7bca8af707ab3c1396c"
 *       - in: "body"
 *         name: "body"
 *         description: "Created appointment object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/appointment"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *     get:
 *       tags:
 *       - "customer"
 *       summary: "Show my all booked future appointments"
 *       description: "Show my all booked future appointments"
 *       operationId: "getappointment"
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
 *         default: "5909d7bca8af707ab3c1396c"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /customer/gallery:
 *     post:
 *       tags:
 *       - "customer"
 *       summary: "Upload single or multiple images in Gallery"
 *       description: "Upload single or multiple images in Gallery"
 *       operationId: "customerGallery"
 *       consumes:
 *       - "multipart/form-data"
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
 *         description: "Logged in user ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5909d7bca8af707ab3c1396c"
 *       - in: "formData"
 *         name: "file"
 *         description: "file to upload"
 *         required: false
 *         type: "file"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /customer/gallery/{image_id}:
 *     delete:
 *       tags:
 *       - "customer"
 *       summary: "Delete image from Gallery"
 *       description: "Delete image from Gallery"
 *       operationId: "customerGalleryDelete"
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
 *         description: "Logged in user ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5909d7bca8af707ab3c1396c"
 *       - in: "path"
 *         name: "image_id"
 *         description: "image ID"
 *         required: true
 *         type: "string"
 *         default: "32326sfsdf632312w32s25"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /barbers:
 *     get:
 *       tags:
 *       - "barber"
 *       summary: "List all barbers"
 *       description: "List all barbers"
 *       operationId: "barbers"
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
 *         description: "Logged in user ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5909d7bca8af707ab3c1396c"
 *       - in: "query"
 *         name: "search"
 *         description: "Search by First/last name"
 *         required: false
 *         type: string
 *         format: string
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /barbers/{barber_id}:
 *     get:
 *       tags:
 *       - "barber"
 *       summary: "Get details of specific barber"
 *       description: "Get barber details like info, rating & comments, galleries"
 *       operationId: "getsinglebarber"
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
 *         default: "5909d7bca8af707ab3c1396c"
 *       - in: "path"
 *         name: "barber_id"
 *         description: "Barber ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "590829388e6a4812ece58e75"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /barber/appointments:
 *     get:
 *       tags:
 *       - "barber"
 *       summary: "As a barber show me customer's requests "
 *       description: "As a barber show me customer's requests"
 *       operationId: "barberAppointment"
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
 *         default: "590829938e6a4812ece58e76"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /barber/confirmappointment/{appointment_id}:
 *     put:
 *       tags:
 *       - "barber"
 *       summary: "Barber accepting/confirming customer's request"
 *       description: "Barber accepting/confirming customer's request"
 *       operationId: "confirmAppointment"
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
 *         default: "590829938e6a4812ece58e76"
 *       - in: "query"
 *         name: "appointment_id"
 *         description: "Appointment id"
 *         required: true
 *         type: string
 *         format: string
 *         default: ""
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /barber/completeappointment/{appointment_id}:
 *     put:
 *       tags:
 *       - "barber"
 *       summary: "Barber mark appointment as completed"
 *       description: "Barber mark appointment as completed"
 *       operationId: "completedAppointment"
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
 *         default: "590829938e6a4812ece58e76"
 *       - in: "query"
 *         name: "appointment_id"
 *         description: "Appointment id"
 *         required: true
 *         type: string
 *         format: string
 *         default: ""
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /barber/cancelAppointment/{appointment_id}:
 *     put:
 *       tags:
 *       - "barber"
 *       summary: "Barber cancelling an appointment"
 *       description: "Barber cancelling an appointment"
 *       operationId: "cancelAppointment"
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
 *         default: "590829938e6a4812ece58e76"
 *       - in: "query"
 *         name: "appointment_id"
 *         description: "Appointment id"
 *         required: true
 *         type: string
 *         format: string
 *         default: ""
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /barber/rescheduleappointment/{appointment_id}:
 *     put:
 *       tags:
 *       - "barber"
 *       summary: "Barber rescheduleappointment an appointment"
 *       description: "Barber rescheduleappointment an appointment"
 *       operationId: "rescheduleAppointment"
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
 *         default: "590829938e6a4812ece58e76"
 *       - in: "query"
 *         name: "appointment_id"
 *         description: "Appointment id"
 *         required: true
 *         type: string
 *         format: string
 *         default: ""
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /barberServices:  
 *     post:
 *       tags:
 *       - "barber"
 *       summary: "Add new service"
 *       description: "Add new service"
 *       operationId: "addbarberservices"
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
 *         default: "590829938e6a4812ece58e76"
 *       - in: "body"
 *         name: "body"
 *         description: "Add new barber service"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/barberService"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"           
 *   /barberServices/{barber_id}:  
 *     get:
 *       tags:
 *       - "barber"
 *       summary: "Show all services of barbers"
 *       description: "Show all services of barbers"
 *       operationId: "getbarberservices"
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
 *         default: "5901e07846c94a225018d5cc"
 *       - in: "path"
 *         name: "barber_id"
 *         description: "Barber ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "590829388e6a4812ece58e75"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /userprofile/{id}:
 *     get:
 *       tags:
 *       - "common"
 *       summary: "Get profile of any customer/barber/shop"
 *       description: "Get profile of any customer/barber/shop"
 *       operationId: "userProfile"
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
 *         default: "5901e07846c94a225018d5cc"
 *       - in: "path"
 *         name: "id"
 *         description: "Customer Id / Barber Id / Shop Id"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5909d7bca8af707ab3c1396c"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid username/password supplied"
 *   /timeslots:
 *     get:
 *       tags:
 *       - "common"
 *       summary: "Time slot to book an appointment"
 *       description: "Time slot to book an appointment"
 *       operationId: "timeSlot"
 *       produces:
 *       - "application/json"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid username/password supplied"
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
 *       confirm:
 *         type: "string"
 *       mobile_number:
 *         type: "string"
 *         default: "9876543210"
 *       user_type:
 *         type: "string"
 *         enum:
 *           - "customer"
 *           - "barber"
 *           - "shop"
 *    facebookUser:
 *     type: "object"
 *     properties:
 *       facebook_id:
 *         type: "string"
 *         default: "9845455251214545"
 *    Userlogin:
 *     type: "object"
 *     properties:
 *       email:
 *         type: "string"
 *         default: "ankushs@smartdatainc.net"
 *       password:
 *         type: "string"
 *         default: "123456"
 *    forgotPassword:
 *      type: "object"
 *      properties:
 *       email:
 *         type: "string"
 *         default: "barbrdoapp@gmail.com"     
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
 *    addChair:
 *      type: "object"
 *      properties:
 *       id:
 *         type: "string"
 *         default: "5901e07846c94a225018d5cc"  
 *    deleteChair:
 *      type: "object"
 *      properties:
 *       chair_id:
 *         type: "string"
 *         default: "5901f19c42207d26eaefb764" 
 *       shop_id:
 *         type: "string"
 *         default: "5901e07846c94a225018d5cc"
 *    appointment:
 *      type: "object"
 *      properties:
 *        shop_id:
 *          type: "string"
 *          default: "5901e07846c94a225018d5cc"
 *        barber_id:
 *          type: "string"
 *          default: "590829388e6a4812ece58e75"
 *        payment_method:
 *          type: "string"
 *          default: "cash"
 *        services:
 *          type: "array"
 *          items:
 *            type: "object"
 *            properties:
 *              id:
 *                type: "string"
 *                default: "590bfe409e74bc91bc044a66"
 *        appointment_date:
 *          type: "string"
 *          default: "2017-07-10 10:00:00"
 *    barberService:
 *      type: "object"
 *      properties:
 *        name:
 *          type: "string"
 *          default: "Hair Color"
 *        price:
 *          type: "number"
 *          default: 75
 *                      
 */
