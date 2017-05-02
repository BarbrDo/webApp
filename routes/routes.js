module.exports = function(app,express){
   var router  = express.Router();
   
    // Models
    var User = require('../models/User');

    // Controllers
    var userController = require('../controllers/user');
    var contactController = require('../controllers/contact');
    var customerController = require('../controllers/customer');
    var shopController = require('../controllers/shop');


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
*           
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
*       password:
*         type: "string"
*       mobile_number:
*         type: "string"
*    Userlogin:
*     type: "object"
*     properties:
*       email:
*         type: "string"
*       password:
*         type: "string"
*/


app.post('/api/v1/signup', userController.signupPost);




app.post('/api/v1/login', userController.loginPost);
app.get('/api/v1/getUserType', userController.getUserType);
app.post('/api/v1/forgot', userController.forgotPost);
app.post('/reset/:token', userController.resetPost);
app.get('/unlink/:provider', userController.ensureAuthenticated, userController.unlink);
app.post('/auth/facebook', userController.authFacebook);
app.get('/auth/facebook/callback', userController.authFacebookCallback);
app.post('/auth/google', userController.authGoogle);
app.get('/auth/google/callback', userController.authGoogleCallback);

}