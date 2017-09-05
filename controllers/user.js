let async = require('async');
let crypto = require('crypto');
let User = require('../models/User');
let nodemailer = require('nodemailer');
let geocoder = require('geocoder');
let jwt = require('jsonwebtoken');
let moment = require('moment');
let request = require('request');
let mongoose = require('mongoose');
let qs = require('querystring');
let objectID = require('mongodb').ObjectID;
let constantObj = require('./../constants.js');
let chairRequest = require('../models/chair_request');
let referal = require('../models/referral');
let commonObj = require('../common/common');
let mg = require('nodemailer-mailgun-transport');
let fs = require('fs');
let path = require('path');
let Shop = require('../models/shop');
let stripeToken = process.env.STRIPE
let stripe = require('stripe')(stripeToken);
let LoggedInUser = require('../models/logged_in_user')
let service = require('../models/service');
let Plan = require('../models/plans');

function generateToken(user) {
  let payload = {
    iss: 'my.domain.com',
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(2, 'days').unix()
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

exports.checkLoggedInUser = function(req, res, next) {
  var token = req.headers.authorization.split(' ')[1];
  LoggedInUser.findOne({
    token: token
  }, function(err, result) {
    if (result) {
      let currentDate = moment().format("YYYY-MM-DD"),
        created_date = moment(result.created_date).add(2, 'days').format("YYYY-MM-DD");
      console.log(currentDate, created_date)
      if (currentDate < created_date) {
        next();
      } else {
        res.status(401).send({
          msg: 'Unauthorized'
        });
      }
    } else {
      res.status(401).send({
        msg: 'Unauthorized'
      });
    }
  })
}

let saveLoggedInUser = function(obj) {
    LoggedInUser(obj).save(obj, function(err, result) {})
  }
  /**
   * POST /login
   * Sign in with email and password
   */

exports.checkSubscription = function(req, res, next) {
  req.checkHeaders("device_id", "Device id is required.").notEmpty();
  req.checkHeaders("device_type", "Device type is required.").notEmpty();
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();
  req.checkHeaders("user_id", 'User Id is required.').notEmpty();
  let errors = req.validationErrors();
  console.log("error", errors);
  console.log("headers", req.headers);
  if (errors) {
    return res.status(400).send({
      msg: "Missing required fields.",
      err: errors
    });
  }

  User.findOne({
      "_id": mongoose.Types.ObjectId(req.headers.user_id)
    }).exec(function(err, data) {
    console.log(data);
    let date = new Date();
    let currentDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD")
    var futureEnddate = moment(data.subscription_end_date).format("YYYY-MM-DD");
    console.log("both dates are", currentDate, futureEnddate);
    if (currentDate > futureEnddate) {
      User.update({
        _id: data[0]._id
      }, {
        $set: {
          "device_type": req.headers.device_type,
          "device_id": req.headers.device_id,
          "is_online": false,
          "is_available": false,
          "latLong": [req.headers.device_longitude, req.headers.device_latitude],
          'remark': "Subscription required."
        }
      }).exec(function(userErr, userUpdate) {
        return res.status(402).send({
          msg: 'Payment required.',
          user: userUpdate
        });
      })
    } else {
      next();
    }
  })
}
exports.loginPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.checkHeaders("device_id", "Device id is required.").notEmpty();
  req.checkHeaders("device_type", "Device type is required.").notEmpty();
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();
  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });
  if (!(req.headers.device_latitude && req.headers.device_longitude)) {
    return res.status(400).send({
      msg: "Location services are not enabled. Please turn on your GPS."
    });
  }
  let errors = req.validationErrors();
  console.log("error", errors);
  console.log("headers", req.headers);

  if (errors) {
    return res.status(400).send({
      msg: "Missing required fields.",
      err: errors
    });
  }
  var device_token = req.headers.device_id;
  var device_type = req.headers.device_type.toLowerCase();
  User.findOne({
    email: req.body.email
  }).exec(function(err, user) {
    console.log(user);
    if (!user) {
      return res.status(401).send({
        msg: 'The email address ' + req.body.email + ' is not associated with any account. ' + 'Double-check your email address and try again.'
      });
    }
    /*-- this condition is for check that this account is active or not---- */
    if (user.is_active == false && user.is_verified == false) {
      return res.status(401).send({
        msg: user.remark
      });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({
          msg: 'Invalid email or password'
        });
      } else {
        let saveLoginUser = {
          user_id: user._id,
          token: generateToken(user)
        };
        async.parallel({
          one: function(callback) {
            LoggedInUser.findOne({
              user_id: user._id
            }, function(err, data) {
              if (data) {
                LoggedInUser.remove({
                  user_id: user._id
                }, function() {
                  saveLoggedInUser(saveLoginUser);
                  callback(null, 'abc\n');
                })
              } else {
                saveLoggedInUser(saveLoginUser)
                callback(null, 'abc\n');
              }
            })
          },
          two: function(callback) {
            User.update({
              _id: user._id
            }, {
              $set: {
                "device_type": device_type,
                "device_id": device_token,
                "latLong": [req.headers.device_longitude, req.headers.device_latitude],
              }
            }).exec(function(userErr, userUpdate) {
              console.log(userUpdate)
              callback(null, 'abc\n');
            })
          }
        }, function(err, result) {
          res.status(200).send({
            token: generateToken(user),
            user: user.toJSON(),
            "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
          });
        })
      }
    });
  });
}

/**
 * POST /signup
 */
let accountActivateMailFunction = function(req, res, user, resetUrl) {
  let auth = {
    auth: {
      api_key: process.env.MAILGUN_APIKEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }
  let nodemailerMailgun = nodemailer.createTransport(mg(auth));
  let mailOptions = {
    to: user.email,
    from: constantObj.messages.email,
    subject: '✔ Welcome to BarbrDo',
    text: 'Welcome'
  };
  console.log(user);
  if (!user.facebook) {
    nodemailerMailgun.sendMail(mailOptions, function(err, info) {
      res.send({
        msg: 'Thanks for signing up with BarbrDo.'
      });
    });
  } else {
    res.status(200).send({
      user: user,
      token: generateToken(user),
      "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
    });
  }
}

let saveShop = function(saveDataForShop, resetUrl, user, req, res) {
  Shop(saveDataForShop).save(function(errSaveShop, shopData) {
    if (errSaveShop) {
      return res.status(400).send({
        msg: constantObj.messages.errorInSave
      })
    } else {
      accountActivateMailFunction(req, res, user, resetUrl);
    }
  });
}

exports.signupPost = function(req, res, next) {
  req.assert('first_name', 'First name cannot be blank.').notEmpty();
  req.assert('last_name', 'Last name cannot be blank.').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('mobile_number', 'Mobile number cannot be blank').notEmpty();
  if (!req.body.facebook) {
    req.assert('password', 'Password must be at least 6 characters long').len(6);
  }
  req.assert('user_type', 'User type cannot be blank').notEmpty();
  if (req.body.user_type == 'barber') {
    req.assert('license_number', 'License number cannot be blank').notEmpty();
  }

  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });

  let errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log("checing live ************************", req.body);

  let saveData = req.body;
  saveData.is_active = true;
  saveData.is_verified = true;
  saveData.is_online = false;
  saveData.is_available = false;
  let email_encrypt = "";
  let generatedText = "";
  console.log("working");
  async.waterfall([
    function(done) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (user) {
          return res.status(400).send({
            msg: 'The email address you have entered is already associated with another account.',
            err: [{
              msg: "The email address you have entered is already associated with another account."
            }]
          });
        } else {
          if (req.headers.device_type) {
            saveData.device_type = req.headers.device_type.toLowerCase();
          }
          if (req.headers.device_id) {
            saveData.device_id = req.headers.device_id;
          }
          if (req.headers.device_longitude && req.headers.device_latitude) {
            saveData.latLong = [req.headers.device_longitude, req.headers.device_latitude];
          }
          if (req.body.facebook) {
            saveData.is_active = true;
            saveData.is_verified = true;
            saveData.remark = '';
          }
          // email_encrypt = commonObj.encrypt(req.body.email);
          // generatedText = commonObj.makeid();
          // saveData.randomString = generatedText;
          // saveData.unique_code = Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
          done(err, saveData)
        }
      })
    },
    function(saveData, done) {
      if (req.body.user_type == 'barber') {
        Plan.findOne({
          "apple_id": "free",
          "google_id": "free"
        }, function(err, data) {


          if (!data) {
            res.status(400).send({
              msg: "Free plan not found in database! Please contact to BarbrDo."
            })
          } else {
            let date = new Date();
            saveData.subscription_start_date = date
            saveData.subscription_end_date = moment(date, "YYYY-MM-DD").add(data.duration, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z'
            saveData.subscription_price = data.price;
            // saveData.subscription_pay_id = data._id;
            saveData.subscription_plan_name = data.name;
            saveData.subscription = [{
              plan_name: data.name,
              start_date: date,
              end_date: moment(date, "YYYY-MM-DD").add(data.duration, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z',
              price: data.price,
              pay_id:data._id
            }]
            done(err, saveData)
          }
        })
      } else {
        done(null, saveData)
      }
    },
    function(saveData, done) {
      console.log("******************",saveData);
      User(saveData).save(saveData, function(err, data) {
        if (err) {
          return res.status(400).send({
            msg: constantObj.messages.errorInSave,
            "err": err
          })
        } else {
          console.log("saveedonline data", data);
          let resetUrl = "http://" + req.headers.host + "/#/" + "account/verification/" + email_encrypt + "/" + generatedText;
          accountActivateMailFunction(req, res, data, resetUrl)
        }
      });
      done()
    }
  ]);
}

/*-----------*/

/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function(req, res, next) {
  console.log("account put", req.body);
  if ('password' in req.body) {
    req.checkHeaders('user_id', 'User ID is missing').notEmpty();
    req.assert('password', 'Password must be at least 6 characters long').len(6);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);
  }
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  User.findById(req.headers.user_id, function(err, user) {
    if ('password' in req.body) {
      user.password = req.body.password;
    } else {
      if (req.body.first_name) {
        user.first_name = req.body.first_name;
      }
      if (req.body.last_name) {
        user.last_name = req.body.last_name;
      }
      if (req.body.mobile_number) {
        user.mobile_number = req.body.mobile_number;
      }
      if ((req.files) && (req.files.length > 0)) {
        user.picture = req.files[0].filename;
      }
      if (req.body.radius_search != 'undefined') {
        user.radius_search = req.body.radius_search;
      }
      if (req.body.is_online) {
        user.is_online = req.body.is_online
      }
      if (req.body.is_available) {
        user.is_available = req.body.is_available
      }
      if (req.body.bio) {
        user.bio = req.body.bio
      }
      if (req.body.is_active == false || req.body.is_active == true) {
        user.is_active = req.body.is_active
      }
      if (req.body.is_verified == false || req.body.is_verified == true) {
        user.is_verified = req.body.is_verified
      }
      if (req.body.is_deleted == false || req.body.is_deleted == true) {
        user.is_verified = req.body.is_verified
      }
    }

    user.save(function(err) {
      if ('password' in req.body) {
        res.send({
          msg: 'Your password has been changed.',
          user: user
        });
      } else if (err && err.code === 11000) {
        res.status(409).send({
          msg: 'The email address you have entered is already associated with another account.'
        });
      } else {
        res.send({
          user: user,
          msg: 'Your profile information has been updated.',
          "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
        });
      }
    });
  });
};


exports.updateSubscribeDate = function(req, res, next) {
  console.log(req.body);
  let updateData = {
    "first_name": req.body.first_name,
    "last_name": req.body.last_name,
    "mobile_number": req.body.mobile_number,
    "is_active": req.body.is_active,
    "is_verified": req.body.is_verified,
    "is_deleted": req.body.is_deleted,
    "subscription_end_date": req.body.endDate
  }
  console.log("updateData", updateData);
  User.update({
    "_id": req.body._id
  }, {
    $set: updateData
  }, function(err, data) {
    if (err) {
      res.status(400).send({
        msg: "error in updating! Please try again later.",
        err: err
      })
    } else {
      res.status(200).send({
        msg: "Successfully udpate.",
        data: data
      })
    }
  })
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
  console.log("inside forgotPost");
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });

  let errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }

  let auth = {
    auth: {
      api_key: process.env.MAILGUN_APIKEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        let token = buf.toString('hex');
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
        user.password_reset_token = token;
        user.password_reset_expires = Date.now() + 3600000; // expire in 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      let nodemailerMailgun = nodemailer.createTransport(mg(auth));
      let mailOptions = {
        to: user.email,
        from: 'support@barbrdo.com',
        subject: '✔ Reset your password on BarbrDo',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' + 'Please click on the following link, or paste this into your browser to complete the process:\n\n' + 'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      nodemailerMailgun.sendMail(mailOptions, function(err, info) {
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

  let errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }

  let auth = {
    auth: {
      api_key: process.env.MAILGUN_APIKEY,
      domain: process.env.MAILGUN_DOMAIN
    }
  }

  async.waterfall([
    function(done) {
      User.findOne({
        passwordResetToken: req.params.token
      }).exec(function(err, user) {
        console.log(err, user)
        if (!user) {
          return res.status(400).send({
            msg: 'Password reset token is invalid or has expired.'
          });
        }
        user.password = req.body.password;
        user.password_reset_token = undefined;
        user.password_reset_expires = undefined;
        user.save(function(err) {
          done(err, user);
        });
      });
    },
    function(user, done) {
      let nodemailerMailgun = nodemailer.createTransport(mg(auth));
      let mailOptions = {
        from: 'support@yourdomain.com',
        to: user.email,
        subject: 'Your barbrdo password has been changed',
        text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };

      nodemailerMailgun.sendMail(mailOptions, function(err, info) {
        res.send({
          msg: 'Your password has been changed successfully.'
        });
        done(err);
      });
    }
  ]);
};

/**
 * POST /auth/facebook
 * Sign in with Facebook
 */
exports.authFacebook = function(req, res) {
  let profileFields = ['id', 'name', 'email', 'gender', 'location'];
  let accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  let graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + profileFields.join(',');

  let params = {
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
      console.log("req.isAuthenticated()", req.isAuthenticated())
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
          user.user_type = 'customer';
          res.send({
            token: generateToken(user),
            user: user
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
              user: user,
              err: 'Error'
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
              first_name: splitName[0],
              last_name: splitName[1],
              email: profile.email,
              gender: profile.gender,
              user_type: 'customer',
              location: profile.location && profile.location.name,
              picture: 'https://graph.facebook.com/' + profile.id + '/picture?type=large',
              facebook: profile.id
            });

            return res.send({
              user: user
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
  let accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  let peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

  let params = {
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
    let accessToken = token.access_token;
    let headers = {
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
          // user.save(function() {
          //   res.send({
          //     token: generateToken(user),
          //     user: user
          //   });
          // });
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
        });
      }
    });
  });
};

exports.authGoogleCallback = function(req, res) {
  res.send('Loading...');
};

exports.checkFaceBook = function(req, res) {
  req.assert('facebook_id', 'facebook_id is required').notEmpty();
  req.checkHeaders("device_id", "Device id is required.").notEmpty();
  req.checkHeaders("device_type", "Device type is required.").notEmpty();
  req.checkHeaders('device_longitude', 'Device longitude cannot be blank.').notEmpty();
  req.checkHeaders("device_latitude", 'services cannot be blank.').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  var device_token = req.headers.device_id;
  var device_type = req.headers.device_type.toLowerCase();
  User.find({
    "facebook": req.body.facebook_id
  }, function(err, response) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData
      });
    } else {
      if (response.length > 0) {

        User.update({
          _id: response._id
        }, {
          $set: {
            "device_type": device_type,
            "device_id": device_token,
            "latLong": [req.headers.device_longitude, req.headers.device_latitude],
            "is_active": false,
            'remark': "Subscription required."
          }
        })

        res.status(200).send({
          msg: constantObj.messages.successRetreivingData,
          token: generateToken(response),
          user: response[0],
          "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
        });
      } else {
        res.status(400).send({
          msg: "This user not found in database"
        });
      }
    }
  })
}

exports.uploadCustomerGallery = function(req, res) {
  req.checkHeaders("user_id", "_id is required").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let updateData = {};
  updateData.modified_date = new Date();
  delete updateData._id;
  console.log("here in ", req.files);
  if ((req.files) && (req.files.length > 0)) {
    let userimg = [];
    for (let i = 0; i < req.files.length; i++) {
      let obj = {};
      obj.name = req.files[i].filename;
      userimg.push(obj);
    }
    updateData.gallery = userimg;
  }
  User.update({
    _id: req.headers.user_id
  }, {
    $push: {
      gallery: {
        $each: updateData.gallery
      }
    }
  }, function(errorInSaveChair, success) {
    if (errorInSaveChair) {
      res.status(400).send({
        msg: 'Error in finding shop.'
      });
    } else {
      User.findOne({
        _id: req.headers.user_id
      }, function(err, response) {
        if (err) {
          res.status(400).send({
            msg: constantObj.messages.errorRetreivingData,
            "err": err
          });
        } else {
          res.status(200).send({
            msg: 'Successfully updated fields.',
            "user": response,
            "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
          });
        }
      })
    }
  })
}

exports.deleteImages = function(req, res) {
  req.checkHeaders("user_id", "").notEmpty();
  req.checkParams("image_id", "Image _id is required").notEmpty();
  //req.assert("image_name", "Image name is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  // let filePath = "../public/uploadedFiles/" + req.body.image_name;
  // fs.unlinkSync(filePath);
  User.update({
    "_id": req.headers.user_id
  }, {
    $pull: {
      "gallery": {
        "_id": req.params.image_id
      }
    }
  }, function(error, result) {
    if (error) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        "err": err
      });
    } else {
      User.findOne({
        _id: req.headers.user_id
      }, function(err, response) {
        if (err) {
          res.status(400).send({
            msg: constantObj.messages.errorRetreivingData,
            "err": err
          });
        } else {
          res.status(200).send({
            msg: 'Successfully updated fields.',
            "user": response,
            "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
          });
        }
      })
    }
  })
}

exports.getProfiles = function(req, res) {
  req.checkParams("id", "customer_id can not be blank").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let id = mongoose.Types.ObjectId(req.params.id);
  User.findOne({
    _id: id
  }).populate('barber_shop_id').populate("ratings.rated_by").exec(function(err, result) {
    if (result) {
      if (err) {
        res.status(400).send({
          msg: constantObj.messages.errorRetreivingData,
          "err": err
        });
      } else {
        let newData = JSON.parse(JSON.stringify(result))
        let rateing = [];
        if (newData.ratings.length > 0) {
          for (var i = 0; i < newData.ratings.length; i++) {
            let obj = {
              rated_by: newData.ratings[i].rated_by._id,
              score: newData.ratings[i].score,
              rated_by_name: newData.ratings[i].rated_by.first_name + " " + newData.ratings[i].rated_by.last_name,
              picture: newData.ratings[i].rated_by.picture,
              appointment_date: newData.ratings[i].appointment_date
            }
            console.log(obj);
            rateing.push(obj)
          };
          newData.ratings = rateing
        } else {
          newData.ratings = rateing
        }
        if (newData.barber_shop_id) {
          delete newData.barber_shop_id;
        }
        if (result.barber_shop_id) {
          newData.shop_info = result.barber_shop_id
        } else {
          newData.shop_info = {}
        }
        res.status(200).send({
          msg: constantObj.messages.successRetreivingData,
          user: newData
        });
      }
    } else {
      res.status(400).send({
        msg: "Please pass correct id"
      })
    }
  })
}

exports.activate = function(req, res) {
  console.log("req.body", req.body);
  if (req.body.email) {
    let email = commonObj.decrypt(req.body.email);
    let randomcode = req.body.randomString;
    console.log(email, randomcode)
    User.findOne({
      email: email,
      random_string: randomcode
    }).exec(function(err, user) {
      console.log
      if (user) {
        user.random_string = '';
        user.is_active = true;
        user.is_verified = true;
        user.remark = "";
        user.save(function(err) {
          res.status(200).send({
            msg: "You have successfully activated your account"
          })
        });
      } else {
        User.findOne({
          email: email,
          is_active: true,
          is_verified: true
        }).exec(function(err, user) {
          return res.status(200).send({
            msg: "Already activated"
          });
        })
      }

    });
  }
}

exports.usersRecords = function(req, res) {
  async.parallel({
    one: function(parallelCb) {
      User.find({
        "$where": "this.stripe_subscription.length>0"
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    two: function(parallelCb) {
      User.find({
        "user_type": "customer"
      }, function(err, result) {
        parallelCb(null, result)
      });
    }
  }, function(err, results) {
    // results will have the results of all 3
    console.log("subscription", results.one);
    console.log("customer", results.two);
    res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      subscription: results.one,
      customer: results.two
    });
  });
}

exports.totalUsers = function(req, res) {
  async.parallel({
    one: function(parallelCb) {
      User.find({
        "user_type": "barber",
        "$where": "this.stripe_subscription.length>0"
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    two: function(parallelCb) {
      User.find({
        "user_type": "shop",
        "$where": "this.stripe_subscription.length>0"
      }, function(err, result) {
        parallelCb(null, result)
      });
    },
    three: function(parallelCb) {
      User.find({
        "user_type": "customer"
      }, function(err, result) {
        parallelCb(null, result)
      });
    }
  }, function(err, results) {
    // results will have the results of all 3
    console.log("subscription", results.one);
    console.log("customer", results.two);
    res.status(200).send({
      msg: constantObj.messages.successRetreivingData,
      barber_subscription: results.one.length,
      shop_subscription: results.two.length,
      customer: results.three.length
    });
  });
}

exports.logout = function(req, res) {
  LoggedInUser.remove({
    user_id: req.headers.user_id
  }, function(err, result) {
    User.update({
      _id: req.headers.user_id
    }, {
      $set: {
        device_id: "",
        device_type: "",
        is_online: false,
        is_available: false
      }
    }).exec(function(err, response) {
      if (err) {
        res.status(400).send({
          msg: "Error in logout.",
          err: err
        });
      } else {
        res.status(200).send({
          msg: "you are logout successfully."
        });
      }
    })
  })
}

exports.stripeWebhook = function(req, res, next) {
  console.log(req.body);
}
exports.getAllServices = function(req, res) {

  service.find({}, function(err, data) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData,
        err: err
      })
    } else {
      res.status(200).send({
        msg: constantObj.messages.successRetreivingData,
        "data": data
      })
    }
  })
}

exports.addServices = function(req, res) {
  var saveData = req.body;
  saveData.status = true;
  console.log("database", saveData)
  service(saveData).save(function(err, data) {
    console.log(data)
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorInSave,
        "err": err
      });
    } else {
      res.status(200).send({
        msg: constantObj.messages.saveSuccessfully,
        "data": data
      });
    }
  })
}

exports.editServices = function(req, res) {
  req.checkParams("service_id", "Barber Service Id is required").notEmpty();
  if (req.validationErrors()) {
    return res.status(400).send({
      msg: "error in request",
      err: req.validationErrors()
    })
  }
  console.log("service_id", req.params.service_id)
  console.log("name", req.body.name)
  service.update({
    _id: req.params.service_id
  }, {
    $set: {
      "name": req.body.name,
    }
  }, function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.userStatusUpdateFailure
      })
    } else {
      res.status(200).send({
        msg: constantObj.messages.userStatusUpdateSuccess
      })
    }
  })

}


exports.deleteServices = function(req, res) {
  req.checkParams("service_id", "Barber Service Id is required").notEmpty();
  if (req.validationErrors()) {
    return res.status(400).send({
      msg: "error in request",
      err: req.validationErrors()
    })
  }
  console.log("service_id", req.params.service_id)
  console.log("name", req.body.name)
  service.update({
    _id: req.params.service_id
  }, {
    $set: {
      "status": false,
    }
  }, function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.userStatusUpdateFailure
      })
    } else {
      res.status(200).send({
        msg: constantObj.messages.userStatusUpdateSuccess
      })
    }
  })
}

exports.enableServices = function(req, res) {
  req.checkParams("service_id", "Barber Service Id is required").notEmpty();
  if (req.validationErrors()) {
    return res.status(400).send({
      msg: "error in request",
      err: req.validationErrors()
    })
  }
  console.log("service_id", req.params.service_id)
  console.log("name", req.body.name)
  service.update({
    _id: req.params.service_id
  }, {
    $set: {
      "status": true,
    }
  }, function(err, result) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.userStatusUpdateFailure
      })
    } else {
      res.status(200).send({
        msg: constantObj.messages.userStatusUpdateSuccess
      })
    }
  })
}
exports.subscribe = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("plan_id", "Plan ObjectId is required").notEmpty();
  req.assert("tranaction_response", "Tranaction response is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log(req.headers.user_id);
  console.log(req.body);
  Plan.findOne({
    _id: req.body.plan_id
  }, function(err, planResult) {
    if (!planResult) {
      return res.status(400).send({
        msg: "Plan not found in database."
      });
    } else {
      User.findOne({
        _id: req.headers.user_id
      }).exec(function(err, data) {
        if (err) {
          return res.status(400).send({
            msg: "This user is not present.",
            "err": err
          });
        } else {
          if (data) {
            let updateData = {
              plan_name: planResult.name,
              price: planResult.price,
            }
            updateData.start_date = new Date();
            updateData.end_date = moment(updateData.start_date, "YYYY-MM-DD").add(planResult.duration, 'day').format("YYYY-MM-DD[T]HH:mm:ss.SSS") + 'Z';
            updateData.pay_id = req.body.tranaction_response[0].productId;
            updateData.tranaction_response = req.body.tranaction_response;
            console.log(updateData);
            User.update({
              _id: req.headers.user_id
            }, {
              $push: {
                subscription: updateData
              },
                $set: {
                  subscription_start_date: updateData.start_date,
                  subscription_end_date: updateData.end_date
                }
            }).exec(function(err, updateInfo) {
              if (err) {
                return res.status(400).send({
                  msg: "Error occurred in subscription.",
                  "err": err
                });
              } else {
                console.log("updateInfo in subscription", updateInfo);
                User.findOne({
                  _id: req.headers.user_id
                }).exec(function(err, user) {
                  return res.status(200).send({
                    "msg": "You are successfully subscribed."
                  });
                })
              }
            })
          } else {
            res.status(400).send({
              msg: "This user is not present."
            });
          }
        }
      })
    }
  })
}