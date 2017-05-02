
var express = require('express');
var router  = express.Router();

var app = express();


/**
* @swagger
* /users:
*   get:
*     description: get the list of all the registered users
*     tags: [Default]
*     responses:
*       200:
*         description: API is working.
*         schema:
*           type: object
*/
app.get('/users',authController.isAuthenticated, userController.getUsers);
/**
* @swagger
/survey:
    post:
      summary: A sample survey.
      consumes:
        - application/x-www-form-urlencoded
      parameters:
        - in: formData
          name: name
          type: string
          description: A person's name.
        - in: formData
          name: fav_number
          type: number
          description: A person's favorite number.
      responses:
        200:
          description: OK
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