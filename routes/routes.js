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
    //Users
    app.post('/api/v1/signup', userController.signupPost);
    app.post('/api/v1/login', userController.loginPost);
    app.post('/api/v1/forgot', userController.forgotPost);
    app.put('/api/v1/account', userController.ensureAuthenticated, userController.accountPut);
    app.delete('/api/v1/account', userController.ensureAuthenticated, userController.accountDelete);
    app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
    app.post('/auth/facebook', userController.authFacebook);
    app.get('/auth/facebook/callback', userController.authFacebookCallback);
    app.post('/auth/google', userController.authGoogle);
    app.get('/auth/google/callback', userController.authGoogleCallback);
    app.post('/reset/:token', userController.resetPost);
    app.post('/api/v1/checkFaceBook', userController.checkFaceBook);
    //Shops
    app.get('/api/v1/shops', shopController.allShops);
    app.put('/api/v1/shops', upload.any(), shopController.editShop);
    app.post('/api/v1/shops/chair', userController.addChair)
    app.delete('/api/v1/shops/chair', userController.removeChair);
    
    
    app.get('/api/v1/barber/:shop_id', shopController.shopContainsBarber);//show all barber related to shop

    //Customer
    app.get('/api/v1/appointment', appointmentController.customerAppointments); //View appointment
    app.post('/api/v1/appointment', appointmentController.takeAppointment); //Book Appointment
    
    //Barber
    app.get('/api/v1/barbers', shopController.allBarbers); //Get all barbers
    app.get('/api/v1/barber/:id',barberServices.viewBarberProfile);//Get specific barber's detail
    
    app.get('/api/v1/barberService/:id',barberServices.viewAllServiesOfBarber); // Get barber's services
    
    app.post('/api/v1/requestChair', chairRequestController.requestChair);
    app.post('/api/v1/bookChair', chairRequestController.bookChair);
    // app.get('/api/v1/barber',barberServices,getAllBarbers); //Get all barbers - radius search

    app.post('/api/v1/barberService', barberServices.addBarberServices); //Add new service in barber
    
    


    //Others
    app.get('/api/v1/getUserType', userController.ensureAuthenticated, userController.getUserType);
    app.post('/api/v1/contact', contactController.contactPost);

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
 *   /account:
 *     put:
 *       tags:
 *       - "user"
 *       summary: "Create user"
 *       description: "This can only be done by the logged in user."
 *       operationId: "createUser"
 *       produces:
 *       - "application/json"
 *       parameters:
 *       - in: "header"
 *         name: "user_id"
 *         description: "Logged in user's id"
 *         required: true
 *         type: string
 *         format: string
 *         default: "59072e9a2fe2cb0f2cafa060"
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
 *       - in: "body"
 *         name: "image"
 *         description: "Upload shop image"
 *         required: false
 *         type: file
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
 *         default: "59072e9a2fe2cb0f2cafa060"
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
 *   /barber:
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
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *   /barber?id=590829388e6a4812ece58e75:  
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
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"
 *           
 *   /barber?shop_id=590829388e6a4812ece58e75:  
 *     get:
 *       tags:
 *       - "barber"
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
 *       responses:
 *         200:
 *           description: "successful operation"
 *         400:
 *           description: "Invalid request"      
 *   /barberService?id=590829388e6a4812ece58e75:  
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
 *       responses:
 *         200:
 *           description: "successful operation"
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
 *       user_type:
 *         type: "string"
 *         enum:
 *           - "customer"
 *           - "barber"
 *           - "shop"
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
 *       image:
 *         type: "file"
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
 *          type: "date"
 *          default: "2017-07-10 10:00:00"
 *            
 */
