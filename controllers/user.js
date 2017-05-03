var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var qs = require('querystring');
var User = require('../models/User');
var Shop = require('../models/shop');
var objectID = require('mongodb').ObjectID;
var constantObj = require('./../constants.js');
let userTypes = require('../models/user_type');
let commonObj = require('../common/common');

function generateToken(user) {
  var payload = {
    iss: 'my.domain.com',
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(7, 'days').unix()
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET);
}

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({
      msg: 'Unauthorized'
    });
  }
};
/**
 * POST /login
 * Sign in with email and password
 */
exports.loginPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg:"error in your request",
      err:errors
      });
  }

  User.findOne({
    email: req.body.email
  }).exec(function(err, user) {

    if (!user) {
      return res.status(401).send({
        msg: 'The email address ' + req.body.email + ' is not associated with any account. ' +
          'Double-check your email address and try again.'
      });
    }

    /*-- this condition is for check that this account is active or not---- */
      // if(user.isActive == false && user.is_verified== false){
      //    return res.status(401).send({
      //     msg: 'Your account is not activated yet.'
      //   });
      // }

      user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({
          msg: 'Invalid email or password'
        });
      }
      res.send({
        token: generateToken(user),
        user: user.toJSON()
      });
    });
  });
};

/**
 * POST /signup
 */
exports.signupPost = function(req, res, next) {
  req.assert('first_name', 'First name cannot be blank.').notEmpty();
  req.assert('last_name', 'Last name cannot be blank.').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('mobile_number','Mobile number cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 6 characters long').len(6);
  
  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg:"error in your request",
      err:errors
      });
  }

  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (user) {
      return res.status(400).send({
        msg: 'The email address you have entered is already associated with another account.'
      });
    }
    var saveData = req.body;
   
    if (req.headers.device_type) {
      saveData.device_type = req.headers.device_type;
    }
    if (req.headers.device_id) {
      saveData.device_id = req.headers.device_id;
    }
    if (req.headers.device_longitude && req.headers.device_latitude) {
      saveData.latLong = [req.headers.device_longitude,req.headers.device_latitude];
    }

    let email_encrypt = commonObj.encrypt(req.body.email);
    let generatedText = commonObj.makeid();
    saveData.user_type ="customer" //customer id
    saveData.randomString = generatedText;
    User(saveData).save(function(err, data) {
      if (err) {
        return res.status(400).send({
          msg: constantObj.messages.errorInSave
        })
      } else {
        var resetUrl = "http://" + req.headers.host + "/#/" + "account/verification/" + email_encrypt + "/" + generatedText;
        if (req.body.typeOfUser == 'barber shop') {
          var saveDataForShop = {};
          saveDataForShop.user_id = data._id
          saveDataForShop.license_number = req.body.license_number;
          Shop(saveDataForShop).save(function(errSaveShop, shopData) {
            if (errSaveShop) {
              return res.status(400).send({
                msg: constantObj.messages.errorInSave
              })
            } else {
              res.status(200).send({
                msg:"Activate your account on the given link.",
                link:resetUrl,
                token: generateToken(shopData),
                data: shopData
              });
            }
          })
        } else {
          res.send({
            msg:"Activate your account on the given link.",
            link:resetUrl,
            token: generateToken(data),
            user: data.toJSON()
            // data: data
          });
        }
      }
    });
  });
};


/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function(req, res, next) {
  if ('password' in req.body) {
    req.assert('password', 'Password must be at least 4 characters long').len(6);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);
  } else {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({
      remove_dots: false
    });
  }

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg:"error in your request",
      err:errors
      });
  }

  User.findById(req.user.id, function(err, user) {
    if ('password' in req.body) {
      user.password = req.body.password;
    } else {
      user.email = req.body.email;
      user.name = req.body.name;
      user.gender = req.body.gender;
      user.location = req.body.location;
      user.website = req.body.website;
    }
    user.save(function(err) {
      if ('password' in req.body) {
        res.send({
          msg: 'Your password has been changed.'
        });
      } else if (err && err.code === 11000) {
        res.status(409).send({
          msg: 'The email address you have entered is already associated with another account.'
        });
      } else {
        res.send({
          user: user,
          msg: 'Your profile information has been updated.'
        });
      }
    });
  });
};

/**
 * DELETE /account
 */
exports.accountDelete = function(req, res, next) {
  User.remove({
    _id: req.user.id
  }, function(err) {
    res.send({
      msg: 'Your account has been permanently deleted.'
    });
  });
};

/**
 * GET /unlink/:provider
 */
exports.unlink = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    switch (req.params.provider) {
      case 'facebook':
        user.facebook = undefined;
        break;
      case 'google':
        user.google = undefined;
        break;
      case 'twitter':
        user.twitter = undefined;
        break;
      case 'vk':
        user.vk = undefined;
        break;
      case 'github':
        user.github = undefined;
        break;
      default:
        return res.status(400).send({
          msg: 'Invalid OAuth Provider'
        });
    }
    user.save(function(err) {
      res.send({
        msg: 'Your account has been unlinked.'
      });
    });
  });
};

/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg:"error in your request",
      err:errors
      });
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (!user) {
          return res.status(400).send({
            msg: 'The email address ' + req.body.email + ' is not associated with any account.'
          });
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'support@barbrdo.com',
        subject: '✔ Reset your password on BarbrDo',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.send({
          msg: 'An email has been sent to ' + user.email + ' with further instructions.'
        });
        done(err);
      });
    }
  ]);
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg:"error in your request",
      err:errors
      });
  }

  async.waterfall([
    function(done) {
      User.findOne({
          passwordResetToken: req.params.token
        })
        .where('passwordResetExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            return res.status(400).send({
              msg: 'Password reset token is invalid or has expired.'
            });
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save(function(err) {
            done(err, user);
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      var mailOptions = {
        from: 'support@yourdomain.com',
        to: user.email,
        subject: 'Your Mega Boilerplate password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        res.send({
          msg: 'Your password has been changed successfully.'
        });
      });
    }
  ]);
};

/**
 * POST /auth/facebook
 * Sign in with Facebook
 */
exports.authFacebook = function(req, res) {
  var profileFields = ['id', 'name', 'email', 'gender', 'location'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + profileFields.join(',');

  var params = {
    code: req.body.code,
    client_id: process.env.FACEBOOK_CLIENTID,
    client_secret: process.env.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({
    url: accessTokenUrl,
    qs: params,
    json: true
  }, function(err, response, accessToken) {
    if (accessToken.error) {
      return res.status(500).send({
        msg: accessToken.error.message
      });
    }
    // Step 2. Retrieve user's profile information.
    request.get({
      url: graphApiUrl,
      qs: accessToken,
      json: true
    }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({
          msg: profile.error.message
        });
      }
      let name = profile.name;
      let splitName = name.split(" ");
      // Step 3a. Link accounts if user is authenticated.
      if (req.isAuthenticated()) {
        User.findOne({
          facebook: profile.id
        }, function(err, user) {
          if (user) {
            return res.status(409).send({
              msg: 'There is already an existing account linked with Facebook that belongs to you.'
            });
          }
          user = req.user;
          user.first_name = splitName[0];
          user.last_name = splitName[1];
          user.gender = user.gender || profile.gender;
          user.picture = user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.facebook = profile.id;
          user.save(function() {
            res.send({
              token: generateToken(user),
              user: user
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({
          facebook: profile.id
        }, function(err, user) {
          if (user) {
            return res.send({
              token: generateToken(user),
              user: user
            });
          }
          User.findOne({
            email: profile.email
          }, function(err, user) {
            if (user) {
              return res.status(400).send({
                msg: user.email + ' is already associated with another account.'
              })
            }
            user = new User({
              first_name : splitName[0],
              last_name : splitName[1],
              email: profile.email,
              gender: profile.gender,
              location: profile.location && profile.location.name,
              picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
              facebook: profile.id
            });
            user.save(function(err) {
              return res.send({
                token: generateToken(user),
                user: user
              });
            });
          });
        });
      }
    });
  });
};

exports.authFacebookCallback = function(req, res) {
  res.send('Loading...');
};
/**
 * POST /auth/google
 * Sign in with Google
 */
exports.authGoogle = function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: process.env.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, {
    json: true,
    form: params
  }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = {
      Authorization: 'Bearer ' + accessToken
    };

    // Step 2. Retrieve user's profile information.
    request.get({
      url: peopleApiUrl,
      headers: headers,
      json: true
    }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({
          message: profile.error.message
        });
      }
      // Step 3a. Link accounts if user is authenticated.
      if (req.isAuthenticated()) {
        User.findOne({
          google: profile.sub
        }, function(err, user) {
          if (user) {
            return res.status(409).send({
              msg: 'There is already an existing account linked with Google that belongs to you.'
            });
          }
          user = req.user;
          user.name = user.name || profile.name;
          user.gender = profile.gender;
          user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
          user.location = user.location || profile.location;
          user.google = profile.sub;
          user.save(function() {
            res.send({
              token: generateToken(user),
              user: user
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({
          google: profile.sub
        }, function(err, user) {
          if (user) {
            return res.send({
              token: generateToken(user),
              user: user
            });
          }
          user = new User({
            name: profile.name,
            email: profile.email,
            gender: profile.gender,
            picture: profile.picture.replace('sz=50', 'sz=200'),
            location: profile.location,
            google: profile.sub
          });
          user.save(function(err) {
            res.send({
              token: generateToken(user),
              user: user
            });
          });
        });
      }
    });
  });
};

exports.authGoogleCallback = function(req, res) {
  res.send('Loading...');
};

exports.addChair = function(req, res) {
  req.assert("_id", "_id is required")
  var validateId = objectID.isValid(req.body._id)
  if (validateId) {
    Shop.findOne({
      _id: req.body._id
    }, function(err, data) {
      if (err) {
        res.status(400).send({
          msg: 'Error in finding shop.'
        });
      } else {
        if (data) {
          var totalNumberOfChairs = data.chairs.length;
          totalNumberOfChairs = totalNumberOfChairs + 1;
          var obj = {};
          var saveChair = [];
          obj.name = 'Chair' + " " + totalNumberOfChairs
          obj.availability = "available";
          saveChair.push(obj);
          var saveChairData = {};
          saveChairData.chairs = saveChair;
          Shop.update({
            _id: req.body._id
          }, {
            $push: {
              chairs: {
                $each: saveChairData.chairs
              }
            }
          }, function(errorInSaveChair, success) {
            if (errorInSaveChair) {
              res.status(400).send({
                msg: 'Error in finding shop.'
              });
            } else {
              res.status(200).send({
                msg: 'Chair successfully added.'
              });
            }
          })
        } else {
          res.status(400).send({
            msg: 'This shop is not present.'
          });
        }
      }
    })
  } else {
    res.status(400).send({
      msg: '_id is not valid.'
    });
  }
}

exports.removeChair = function(req, res) {
  req.assert("_id", "_id is required")
  req.assert("chair_id", "Chair objectID is required");
  var validateId = objectID.isValid(req.body._id);
  var validateChairId = objectID.isValid(req.body.chair_id)
  if (validateId && validateChairId) {
    Shop.update({
      _id: req.body._id,
      "chairs._id":req.body.chair_id
    }, {
      $set: {"chairs.$.isActive":false}
    }).exec(function(errInDelete, resultInDelete) {
      if (errInDelete) {
        res.status(400).send({
          msg: 'Error in deleting chair.'
        });
      } else {
          res.status(200).send({
            msg: 'Chair successfully deleted.'
          });
      }
    })
  } else {
    res.status(400).send({
      msg: 'Please pass correct fields.'
    });
  }
}

exports.getUserType = function(req,res){
  userTypes.find({isDeleted:false},{isDeleted:0},function(err,data){
    if(err){
       res.status(400).send({
          msg: constantObj.messages.errorRetreivingData
        });
    }
    else{
       res.status(200).send({
          msg: constantObj.messages.successRetreivingData,
          data:data
        });
    }
  })
}