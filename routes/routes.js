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
    let path = require('path');
    // Controllers
    let userController = require('./../controllers/user');
    let contactController = require('./../controllers/contact');
    let customerController = require('./../controllers/customer');
    let shopController = require('./../controllers/shop');
    let chairRequestController = require('./../controllers/chair_request');
    let appointmentController = require('./../controllers/appointment');
    let barberServices = require('./../controllers/barber');
    let commonObj = require('./../common/common');
    //Users
    app.post('/api/v1/activate', userController.activate) //Account activate
    app.post('/api/v1/signup', userController.signupPost); //Signup
    app.post('/api/v1/signupWeb', userController.signupPostWeb); //Signup
    app.post('/api/v1/login', userController.loginPost); // Login
    app.post('/api/v1/forgot', userController.forgotPost); //Forgot Password
    app.post('/api/v1/reset/:token', userController.resetPost); //Forgot Password
    app.put('/api/v1/account',upload.any(), userController.accountPut); // Account update
    app.delete('/api/v1/account', userController.ensureAuthenticated, userController.accountDelete);
    app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
    app.post('/auth/facebook', userController.authFacebook);
    app.get('/auth/facebook/callback', userController.authFacebookCallback);
    //app.post('/auth/google', userController.authGoogle);
    //app.get('/auth/google/callback', userController.authGoogleCallback);
    app.post('/reset/:token', userController.resetPost);
    app.post('/api/v1/checkFaceBook', userController.checkFaceBook);    
    //Shops
    app.get('/api/v1/allshops',shopController.listshops); // All shops registered in system
    app.get('/api/v1/shops', shopController.allShops); // List barber associated shops only
    app.put('/api/v1/shops', shopController.updateShop); //Update shop
    app.post('/api/v1/shops/chair', userController.addChair) //Add chair in shop
    app.get('/api/v1/shops/chair',shopController.allShopsHavingChairs);// It will show all shops having number of chairs
    app.delete('/api/v1/shops/chair', userController.removeChair); // Remove chair from shop
    app.get('/api/v1/shops/barberchairrequests/:shop_id',chairRequestController.barberChairReqests); //Get all barber's request for chairs
    // app.post('/api/v1/shops/confirmchair', chairRequestController.bookChair);
    app.get('/api/v1/shops/barbers/:shop_id', shopController.shopContainsBarber);//show all barber related to shop
    app.put('/api/v1/shops/managechair',shopController.manageChair);
    app.put('/api/v1/shops/postchairtoallbarbers',shopController.postChairToAllBarbers);
    app.get('/api/v1/shops/chair/:shop_id',shopController.shopContainsChairs);
    app.put('/api/v1/shops/markchairasbooked/:chair_id',shopController.markChairAsBooked);
    app.put('/api/v1/shops/acceptrequest',chairRequestController.acceptRequest); 
    
    //Customer
    app.get('/api/v1/allcustomers',customerController.listcustomers);
    app.get('/api/v1/appointment', appointmentController.customerAppointments); //View appointment
    app.post('/api/v1/appointment', appointmentController.takeAppointment); //Book Appointment
    app.post('/api/v1/customer/gallery', upload.any(), userController.uploadCustomerGallery); //Upload image in gallery
    app.delete('/api/v1/customer/gallery/:image_id',userController.deleteImages); //Delete image from gallery
    app.get('/api/v1/appointment/pending/:_id',appointmentController.pendingConfiramtion);
    app.post('/api/v1/ratebarber',barberServices.rateBarber);
    
    //Barber
    app.get('/api/v1/allbarbers', barberServices.availableBarber); //Get all barbers
    app.get('/api/v1/barbers', shopController.associatedBarbers); //List all barbers
    app.get('/api/v1/barbers/:barber_id',barberServices.viewBarberProfile);//Get barber details like info, rating & comments, galleries
    app.post('/api/v1/barber/gallery',upload.any(), barberServices.uploadBarberGallery);//Upload single or multiple images in Gallery
    app.delete('/api/v1/barber/gallery/:image_id',barberServices.deleteImages); //Delete image from gallery
    app.get('/api/v1/barber/appointments',barberServices.appointments);//As a barber show me customer's requests
    app.put('/api/v1/barber/confirmappointment/:appointment_id',barberServices.confirmAppointment);//Barber accepting/confirming customer's request
    app.put('/api/v1/barber/completeappointment/:appointment_id',barberServices.completeAppointment);//Barber mark appointment as completed
    app.put('/api/v1/barber/cancelappointment/:appointment_id', barberServices.cancelAppointment);//Barber cancelling an appointment
    app.put('/api/v1/barber/rescheduleappointment/:appointment_id',barberServices.rescheduleAppointment);//Barber reschedule an appointment
    app.post('/api/v1/requestchair', chairRequestController.requestChair); //Barber/shop requesting chair to shop
    app.get('/api/v1/barber/services', barberServices.getAllServices); //Get all services
    app.post('/api/v1/barber/services', barberServices.addBarberServices); //Add new service
    app.put('/api/v1/barber/services/:barber_service_id',barberServices.editBarberServices); //Edit Barber services
    app.get('/api/v1/barber/services/:barber_id',barberServices.viewAllServiesOfBarber); // Show all services of barbers
    app.delete('/api/v1/barber/services/:barber_service_id',barberServices.deleteBarberService);// Delete barber service
    app.get('/api/v1/barber/particularAppointment/:appointment_id',barberServices.particularAppointment);
    app.get('/api/v1/barber/shopchairrequests/:barber_id',chairRequestController.shopChairRequest); // Manage request in barber module
    app.get('/api/v1/barber/timeavailability/:barber_id',barberServices.viewBarberAvailability)
    app.post('/api/v1/barber/contactshop',contactController.contactShop);

    //Common
    app.get('/api/v1/userprofile/:id', userController.getProfiles); //Get profile of any customer/barber/shop
    //app.get('/api/v1/timeslots',commonObj.viewTimeSlots); //Time slot to book an appointment
    //app.get('/api/v1/getUserType', userController.ensureAuthenticated, userController.getUserType);
    app.post('/api/v1/contact', contactController.contactPost);
    app.get('/api/v1/shops/barbers/:shop_id/:barber_id',shopController.getDataForBookNowPage)

    // Stripe Implementation API
    app.get('/api/v1/plans', userController.featuringPlans);
    app.post('/api/v1/subscribe',userController.subscribe);
    app.post('/api/v1/createCharges',userController.createCharges);
    app.post('/api/v1/webhooks',userController.stripeWebhook);
    
    //Need to delete in sprint-8
    app.post('/api/v1/barber/requestchair', chairRequestController.requestChair); //Barber/shop requesting chair to shop
    app.get('/admin', function(req, res) {
        res.sendFile(path.join(__dirname + './../public/indexAdmin.html'));
    });
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
 *         description: "Logged in user's id"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5943a0c2f409f91359e84f3e"
 *       - in: "body"
 *         name: "body"
 *         description: "Created user object"
 *         required: false
 *         schema:
 *           $ref: "#/definitions/User"
 *       - in: "formData"
 *         name: "picture"
 *         description: "file to upload"
 *         required: false
 *         type: "file"
 *       responses:
 *         200:
 *           description: "successful operation"
 *   /allshops:
 *     get:
 *       tags:
 *       - "shop"
 *       summary: "All shops registered in system"
 *       description: "All shops registered in system"
 *       operationId: "allshops"
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
 *       - in: "query"
 *         name: "count"
 *         description: "Pass number of records want to fetch"
 *         required: false
 *         type: number
 *         format: number
 *       - in: "query"
 *         name: "page"
 *         description: "Pagination"
 *         required: false
 *         type: number
 *         format: number
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /shops:          
 *     get:
 *       tags:
 *       - "shop"
 *       summary: "List barber associated shops only"
 *       description: "List barber associated shops only"
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
 *         default: "5943a470f409f91359e84f47"
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
 *       summary: "Add chair in shop"
 *       description: "Add chair in shop"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "body"
 *         name: "body"
 *         description: "Send shop Id"
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
 *       summary: "Remove chair from shop"
 *       description: "Remove chair from shop"
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
 *         default: ""
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
 *       summary: "It will show all shops having available chairs"
 *       description: "It will show all shops having available chairs"
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
 *         default: "591be608b902f60fcc14a9d3"
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
 *   /shops/barberchairrequests/{shop_id}:
 *     get:
 *       tags:
 *       - "shop"
 *       summary: "Get all barber's request for chairs"
 *       description: "Get all barber's request for chairs"
 *       operationId: "barberChairReqests"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "path"
 *         name: "shop_id"
 *         description: "Shop ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: '5943a472f409f91359e84f48'
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "path"
 *         name: "shop_id"
 *         description: "Shop ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5943a472f409f91359e84f48"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"      
 *   /shops/managechair:
 *     put:
 *       tags:
 *       - "shop"
 *       summary: "Manage chair"
 *       description: "Manage chair"
 *       operationId: "managechair"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "body"
 *         name: "body"
 *         description: "Created shop object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/managechair"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /shops/postchairtoallbarbers:
 *     put:
 *       tags:
 *       - "shop"
 *       summary: "Post chair to all barbers"
 *       description: "Post chair to all barbers"
 *       operationId: "postchairtoallbarbers"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "body"
 *         name: "body"
 *         description: "Created shop object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/postchairtoallbarbers"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /shops/markchairasbooked/{chair_id}:
 *     put:
 *       tags:
 *       - "shop"
 *       summary: "Post chair to all barbers"
 *       description: "Post chair to all barbers"
 *       operationId: "postchairtoallbarbers"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "path"
 *         name: "chair_id"
 *         description: "Chair ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5943a6d138f18d1b28d5d5b0"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /shops/acceptrequest:
 *     put:
 *       tags:
 *       - "shop"
 *       summary: "Accept/Decline barber's chair request"
 *       description: "Accept/Decline barber's chair request"
 *       operationId: "acceptrequest"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "body"
 *         name: "body"
 *         description: "Created appointment object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/acceptrequest"
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
 *         default: "5943a0c2f409f91359e84f3e"
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
 *         default: "5943a0c2f409f91359e84f3e"
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
 *         default: "5943a0c2f409f91359e84f3e"
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
 *         default: "5943a0c2f409f91359e84f3e"
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
 *   /ratebarber:
 *     post:
 *       tags:
 *       - "customer"
 *       summary: "Rate to barber"
 *       description: "Rate to barber"
 *       operationId: "ratebarber"
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
 *         default: "5943a0c2f409f91359e84f3e"
 *       - in: "body"
 *         name: "body"
 *         description: "Create rate object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/ratebarber"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   
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
 *         default: "5943a0c2f409f91359e84f3e"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
 *         name: "barber_id"
 *         description: "Barber ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5943bff1d8130d156721036d"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /barber/gallery:
 *     post:
 *       tags:
 *       - "barber"
 *       summary: "Upload single or multiple images in Gallery"
 *       description: "Upload single or multiple images in Gallery"
 *       operationId: "barberGallery"
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
 *         default: "5943bff1d8130d156721036d"
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
 *   /barber/gallery/{image_id}:
 *     delete:
 *       tags:
 *       - "barber"
 *       summary: "Delete image from Gallery"
 *       description: "Delete image from Gallery"
 *       operationId: "barberGalleryDelete"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
 *         name: "image_id"
 *         description: "image ID"
 *         required: true
 *         type: "string"
 *         default: ""
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
 *         default: "5943bff1d8130d156721036d"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
 *         name: "appointment_id"
 *         description: "Appointment id"
 *         required: true
 *         type: string
 *         format: string
 *         default: ""
 *       - in: "body"
 *         name: "body"
 *         description: "Confirm appointment object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/confirmAppointment"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /barber/cancelappointment/{appointment_id}:
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
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
 *       summary: "Barber reschedule an appointment"
 *       description: "Barber reschedule an appointment"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
 *         name: "appointment_id"
 *         description: "Appointment id"
 *         required: true
 *         type: string
 *         format: string
 *         default: ""
 *       - in: "body"
 *         name: "body"
 *         description: "Reschedule appointment object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/rescheduleAppointment"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /requestchair:
 *     post:
 *       tags:
 *       - "barber"
 *       summary: "Barber or shop requesting for a chair to opposite party"
 *       description: "Barber or shop requesting for a chair to opposite party"
 *       operationId: "requestChair"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "body"
 *         name: "body"
 *         description: "Requesting a chair object"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/requestChair"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"  
 *   /barber/services:  
 *     get:
 *       tags:
 *       - "barber"
 *       summary: "Get all active services"
 *       description: "Get all active services"
 *       operationId: "getAllServices"
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
 *         default: "5943bff1d8130d156721036d"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"           
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
 *         default: "5943bff1d8130d156721036d"
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
 *   /barber/services/{barber_service_id}: 
 *     put:
 *       tags:
 *       - "barber"
 *       summary: "Barber edit his service"
 *       description: "Barber edit his service"
 *       operationId: "editBarberService"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
 *         name: "barber_service_id"
 *         description: "Barber-Service_ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "591bf1d39f3ee312abea7e95"
 *       - in: "body"
 *         name: "body"
 *         description: "Edit service parameters"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/editBarberService"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"           
 *     delete:
 *       tags:
 *       - "barber"
 *       summary: "Barber deleting his service"
 *       description: "Barber deleting his service"
 *       operationId: "deleteBarberService"
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
 *         name: "barber_service_id"
 *         description: "Barber-Service-ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "591bf1d39f3ee312abea7e95"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"           
 *   /barber/services/{barber_id}:  
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
 *         default: "5943bff1d8130d156721036d"
 *       - in: "path"
 *         name: "barber_id"
 *         description: "Barber ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5943bff1d8130d156721036d"
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /barber/shopchairrequests/{barber_id}:
 *     get:
 *       tags:
 *       - "barber"
 *       summary: "Get all shop's request to barber for chairs"
 *       description: "Get all shop's request to barber for chairs"
 *       operationId: "shopchairrequests"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "path"
 *         name: "barber_id"
 *         description: "Barber User ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: '591be608b902f60fcc14a9d3'
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
*   /barber/timeavailability/{barber_id}:
 *     get:
 *       tags:
 *       - "barber"
 *       summary: "Show barber's availability to customer"
 *       description: "Show barber's availability to customer"
 *       operationId: "timeavailability"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "path"
 *         name: "barber_id"
 *         description: "Barber User ID"
 *         required: true
 *         type: string
 *         format: string
 *         default: '5948dcc7c5a04e5004416516'
 *       - in: "query"
 *         name: "date"
 *         description: "Booking Date(YYYY-MM-DD)"
 *         required: true
 *         type: string
 *         format: string
 *         default: '2017-12-30'
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
 *         default: "5943a0c2f409f91359e84f3e"
 *       - in: "path"
 *         name: "id"
 *         description: "Customer Id / Barber Id / Shop Id"
 *         required: true
 *         type: string
 *         format: string
 *         default: "5943a0c2f409f91359e84f3e"
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
 *   /contact:
 *     post:
 *       tags:
 *       - "common"
 *       summary: "Contact BarbrDo"
 *       description: "Contact BarbrDo"
 *       operationId: "contact"
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
 *         default: "5943a470f409f91359e84f47"
 *       - in: "body"
 *         name: "body"
 *         description: "Contact parameters"
 *         required: true
 *         schema:
 *           $ref: "#/definitions/contact"
 
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
 *         default: "Customer"
 *       last_name:
 *         type: "string"
 *         default: "One"
 *       email:
 *         type: "string"
 *         default: "customer@email.com"
 *         required: true
 *       password:
 *         type: "string"
 *         default: "123456"
 *         required: true
 *       confirm:
 *         type: "string"
 *         default: "123456"
 *       mobile_number:
 *         type: "string"
 *         default: "9876543210"
 *         required: true
 *       user_type:
 *         type: "string"
 *         required: true
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
 *         default: "customer@email.com"
 *       password:
 *         type: "string"
 *         default: "123456"
 *    forgotPassword:
 *      type: "object"
 *      properties:
 *       email:
 *         type: "string"
 *         default: "ankushs@smartdatainc.net"     
 *    Shop:
 *     type: "object"
 *     properties:
 *       _id:
 *         type: "string"
 *         default: "5943a472f409f91359e84f48"
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
 *       _id:
 *         type: "string"
 *         default: "5943a472f409f91359e84f48"  
 *    deleteChair:
 *      type: "object"
 *      properties:
 *       chair_id:
 *         type: "string"
 *         default: "5901f19c42207d26eaefb764" 
 *       shop_id:
 *         type: "string"
 *         default: "5943a472f409f91359e84f48"
 *    managechair:
 *      type: "object"
 *      properties:
 *       chair_id:
 *         type: "string"
 *         default: "5943a6d138f18d1b28d5d5b0"  
 *       type:
 *         type: "string"
 *         default: "percentage" 
 *         text: "percentage | weekly | monthly"
 *       barber_percentage:
 *         type: "number"
 *         default: "50"
 *       shop_percentage:
 *         type: "number"
 *         default: "50"
 *       amount:
 *         type: "number"
 *         default: "50"   
 *    postchairtoallbarbers:
 *      type: "object"
 *      properties:
 *       chair_id:
 *         type: "string"
 *         default: "5901f19c42207d26eaefb764"
 *    acceptrequest:
 *      type: "object"
 *      properties:
 *       chair_request_id:
 *         type: "string"
 *       request_type:
 *         type: "string"
 *         default: "accept|decline"
 *    appointment:
 *      type: "object"
 *      properties:
 *        shop_id:
 *          type: "string"
 *          default: "5943a472f409f91359e84f48"
 *        barber_id:
 *          type: "string"
 *          default: "5943bff1d8130d156721036d"
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
 *                default: "591bf1d39f3ee312abea7e95"
 *        appointment_date:
 *          type: "string"
 *          default: "2017-07-10 10:00:00"
 *    ratebarber:
 *      type: "object"
 *      properties:
 *        appointment_id:
 *          type: "string"
 *          default: ""
 *        appointment_date:
 *          type: "string"
 *          default: "2017-07-10 10:00:00"
 *        barber_id:
 *          type: "string"
 *          default: "5943bff1d8130d156721036d"
 *        score:
 *          type: "number"
 *          default: 5
 *        rated_by_name:
 *          type: "string"
 *          default: "Customer One"
 *    requestChair:
 *      type: "object"
 *      properties:
 *        shop_id:
 *          type: "string"
 *          default: "5943a472f409f91359e84f48"
 *        chair_id:
 *          type: "string"
 *          default: "5943a6d138f18d1b28d5d5b0"
 *        barber_id:
 *          type: "string"
 *          default: "5943bff1d8130d156721036d"
 *        barber_name:
 *          type: "string"
 *          default: "Barber One"
 *        booking_date:
 *          type: "string"
 *          default: "2017-07-20"  
 *    barberService:
 *      type: "object"
 *      properties:
 *        service_id:
 *          type: "string"
 *          default: "5923bcf1e824f016145999b5"
 *        name:
 *          type: "string"
 *          default: "Hair Color"
 *        price:
 *          type: "number"
 *          default: 75
 *    editBarberService:
 *      type: "object"
 *      properties:
 *        price:
 *          type: "number"
 *          default: 75
 *    confirmAppointment:
 *      type: "object"
 *      properties:
 *       customer_id:
 *         type: "string"
 *         default: "5943a0c2f409f91359e84f3e"
 *       score:
 *         type: "number"
 *         default: 4
 *       rated_by_name:
 *         type: "string"
 *         default: "Customer One"
 *       appointment_date:
 *         type: "string"
 *         default: "2017-05-25"
 *    rescheduleAppointment:
 *      type: "object"
 *      properties:
 *       minutes:
 *         type: "number"
 *         default: 15 
 *       appointment_date:
 *         type: "number"
 *         default: ""
 *    contact:
 *      type: "object"
 *      properties:
 *       name:
 *         type: "string"
 *         default: "Pop's Barber Shop" 
 *       email:
 *         type: "number"
 *         default: ""
 *       message:
 *         type: "number"
 *         default: ""
 */
