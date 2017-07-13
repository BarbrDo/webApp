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
let Shop = require('../models/shop');
let Barber = require('../models/barber');
let objectID = require('mongodb').ObjectID;
let constantObj = require('./../constants.js');
//let userTypes = require('../models/user_type');
let commonObj = require('../common/common');
let mg = require('nodemailer-mailgun-transport');
let fs = require('fs');
let path = require('path');
let stripeToken = process.env.STRIPE
let stripe = require('stripe')(stripeToken);

function generateToken(user) {
  let payload = {
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

  let errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }

  User.findOne({
    email: req.body.email
  }).exec(function(err, user) {
    console.log(user);
    if (!user) {
      return res.status(401).send({
        msg: 'The email address ' + req.body.email + ' is not associated with any account. ' +
          'Double-check your email address and try again.'
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
      }

      let currentDate = moment().format("YYYY-MM-DD"),
      createDate = moment(user.created_date).format("YYYY-MM-DD"),
      futureMonth = moment(createDate).add(2, 'M');
      futureMonth = moment(futureMonth).format("YYYY-MM-DD")
      console.log("currentDate,createDate,futureMonth", currentDate, createDate, futureMonth);
      console.log("condition",currentDate > futureMonth);      
      if (currentDate > futureMonth && user.subscription==false) {
        User.update({
          _id: user._id
        }, {
          $set: {
            "is_active": false,
            'remark': "Subscription required."
          }
        }).exec(function(userErr, userUpdate) {
          if (userErr) {
            console.log(userErr)
          } else {
            console.log(userUpdate)
            res.status(402).send({
              msg: 'Subscription required.',
              user:user
            });
          }
        })
      } else {
        res.status(200).send({
          token: generateToken(user),
          user: user.toJSON(),
          "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
        });
      }
    });
  });
}

/**
 * POST /signup
 */
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

let accountActivateMailFunction = function(req, res, user, resetUrl) {
    console.log("accountActivateMailFunction", user);
    let auth = {
      auth: {
        api_key: process.env.MAILGUN_APIKEY,
        domain: process.env.MAILGUN_DOMAIN
      }
    }
    let nodemailerMailgun = nodemailer.createTransport(mg(auth));
    let mailOptions = {
      to: user.email,
      from: 'support@barbrdo.com',
      subject: '✔ Activate Your Account',
      text: 'Please Activate your account by clicking link \n\n' + resetUrl + '\n\n'
    };
    console.log(user);
    if (!user.facebook) {
      nodemailerMailgun.sendMail(mailOptions, function(err, info) {
        res.send({
          msg: 'An email has been sent to ' + user.email + ' with further instructions.'
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
  /*
  ---------------------------------
  Pre version of sign up function
  ---------------------------------
  */
  // exports.signupPost = function(req, res, next) {
  //   console.log(req.body);
  //   req.assert('first_name', 'First name cannot be blank.').notEmpty();
  //   req.assert('last_name', 'Last name cannot be blank.').notEmpty();
  //   req.assert('email', 'Email is not valid').isEmail();
  //   req.assert('email', 'Email cannot be blank').notEmpty();
  //   req.assert('mobile_number', 'Mobile number cannot be blank').notEmpty();
  //   if (!req.body.facebook) {
  //     req.assert('password', 'Password must be at least 6 characters long').len(6);
  //   }
  //   req.assert('user_type', 'User type cannot be blank').notEmpty();
  //   if (req.body.user_type == 'shop' || req.body.user_type == 'barber') {
  //     req.assert('license_number', 'License number cannot be blank').notEmpty();
  //   }

//   req.sanitize('email').normalizeEmail({
//     remove_dots: false
//   });
//   let errors = req.validationErrors();

//   if (errors) {
//     res.status(400).send({
//       msg: "error in your request",
//       err: errors
//     });
//   }
//   User.findOne({
//     email: req.body.email
//   }, function(err, user) {
//     if (user) {
//       return res.status(400).send({
//         msg: 'The email address you have entered is already associated with another account.',
//         err: [{
//           msg: "The email address you have entered is already associated with another account."
//         }]
//       });
//     }
//     let saveData = req.body;

//     if (req.headers.device_type) {
//       saveData.device_type = req.headers.device_type;
//     }
//     if (req.headers.device_id) {
//       saveData.device_id = req.headers.device_id;
//     }
//     if (req.headers.device_longitude && req.headers.device_latitude) {
//       saveData.latLong = [req.headers.device_longitude, req.headers.device_latitude];
//     }
//     if (req.body.facebook) {
//       saveData.isActive = true;
//       saveData.is_verified = true;
//     }

//     let email_encrypt = commonObj.encrypt(req.body.email);
//     let generatedText = commonObj.makeid();

//     saveData.randomString = generatedText;

//     User(saveData).save(function(err, data) {
//       if (err) {
//         return res.status(400).send({
//           msg: constantObj.messages.errorInSave,
//           "err": err
//         })
//       } else {
//         let resetUrl = "http://" + req.headers.host + "/#/" + "account/verification/" + email_encrypt + "/" + generatedText;
//         if (req.body.user_type == 'shop') {
//           let saveDataForShop = {};
//           saveDataForShop.user_id = data._id
//           saveDataForShop.license_number = req.body.license_number;
//           saveDataForShop.name = req.body.name;
//           saveDataForShop.state = req.body.state;
//           saveDataForShop.city = req.body.city;
//           saveDataForShop.zip = req.body.zip;

//           if (req.headers.device_longitude && req.headers.device_latitude) {
//             saveDataForShop.latLong = [req.headers.device_longitude, req.headers.device_latitude];
//             saveShop(saveDataForShop, resetUrl, data, req, res);
//           } else if (req.body.zip) {
//             geocoder.geocode(req.body.zip, function(errGeo, latlng) {
//               if (errGeo) {
//                 return res.status(400).send({
//                   msg: constantObj.messages.errorInSave
//                 })
//               } else {
//                 saveDataForShop.latLong = [latlng.results[0].geometry.location.lng, latlng.results[0].geometry.location.lat];
//                 saveShop(saveDataForShop, resetUrl, data, req, res);
//               }
//             });
//           } else {
//             saveShop(saveDataForShop, resetUrl, data, req, res);
//           }
//         } else if (req.body.user_type == 'barber') {
//           let saveDataForBarber = {};
//           saveDataForBarber.user_id = data._id
//           saveDataForBarber.license_number = req.body.license_number;
//           Barber(saveDataForBarber).save(function(errSaveBarber, barberData) {
//             if (errSaveBarber) {
//               return res.status(400).send({
//                 msg: constantObj.messages.errorInSave
//               })
//             } else {
//               accountActivateMailFunction(req, res, data, resetUrl)
//             }
//           })
//         } else if (req.body.facebook) {
//           res.send({
//             msg: "please check your email to verify your account.",
//             link: resetUrl,
//             token: generateToken(data),
//             user: data.toJSON(),
//             "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
//           });
//         } else {
//           accountActivateMailFunction(req, res, data, resetUrl)
//         }
//       }
//     });
//   });
// };


/*Sign up */

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
  if (req.body.user_type == 'shop' || req.body.user_type == 'barber') {
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
  let saveData = req.body;
  let email_encrypt = "";
  let generatedText = "";
  async.waterfall([
    function(done) {
      console.log("first callback .");
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
            saveData.device_type = req.headers.device_type;
          }
          if (req.headers.device_id) {
            saveData.device_id = req.headers.device_id;
          }
          if (req.headers.device_longitude && req.headers.device_latitude) {
            saveData.latLong = [req.headers.device_longitude, req.headers.device_latitude];
          }
          if (req.body.facebook) {
            saveData.isActive = true;
            saveData.is_verified = true;
            saveData.remark = '';
          }
          email_encrypt = commonObj.encrypt(req.body.email);
          generatedText = commonObj.makeid();
          saveData.randomString = generatedText;
          done(err, saveData)
        }
      })
    },
    function(saveData, done) {
      if (req.body.user_type == 'customer') {
        done(null, saveData)
      } else {
        stripe.customers.create({
            email: req.body.email,
            metadata: {
              user_type: req.body.user_type,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              mobile_number: req.body.mobile_number
            }
          },
          function(err, customer) {
            if (err) {
              return res.status(400).send({
                msg: "Error occurred on stripe.",
                "err": err
              })
            } else {
              console.log("customer created on stripe ", customer);
              saveData.isActive = false;
              saveData.is_verified = false;
              saveData.stripe_customer = customer;
              done(err, saveData)
            }
          })
      }
    },
    function(saveData, done) {
      User(saveData).save(function(err, data) {
        if (err) {
          return res.status(400).send({
            msg: constantObj.messages.errorInSave,
            "err": err
          })
        } else {
          let resetUrl = "http://" + req.headers.host + "/#/" + "account/verification/" + email_encrypt + "/" + generatedText;
          if (req.body.user_type == 'shop') {
            let saveDataForShop = {};
            saveDataForShop.user_id = data._id
            saveDataForShop.license_number = req.body.license_number;
            saveDataForShop.name = req.body.name;
            saveDataForShop.state = req.body.state;
            saveDataForShop.city = req.body.city;
            saveDataForShop.zip = req.body.zip;
            if (req.headers.device_longitude && req.headers.device_latitude) {
              saveDataForShop.latLong = [req.headers.device_longitude, req.headers.device_latitude];
              saveShop(saveDataForShop, resetUrl, data, req, res);
            } else if (req.body.zip) {
              geocoder.geocode(req.body.zip, function(errGeo, latlng) {
                if (errGeo) {
                  return res.status(400).send({
                    msg: constantObj.messages.errorInSave
                  })
                } else {
                  saveDataForShop.latLong = [latlng.results[0].geometry.location.lng, latlng.results[0].geometry.location.lat];
                  saveShop(saveDataForShop, resetUrl, data, req, res);
                }
              });
            } else {
              saveShop(saveDataForShop, resetUrl, data, req, res);
            }
          } else if (req.body.user_type == 'barber') {
            let saveDataForBarber = {};
            saveDataForBarber.user_id = data._id
            saveDataForBarber.license_number = req.body.license_number;
            Barber(saveDataForBarber).save(function(errSaveBarber, barberData) {
              if (errSaveBarber) {
                return res.status(400).send({
                  msg: constantObj.messages.errorInSave
                })
              } else {
                console.log("else part of barber save");
                // res.send({
                //   token: generateToken(data),
                //   user: data.toJSON(),
                //   "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
                // });
                accountActivateMailFunction(req, res, data, resetUrl)
              }
            })
          } else {
            accountActivateMailFunction(req, res, data, resetUrl)
          }
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
      if (req.body.gender != 'undefined') {
        user.gender = req.body.gender;
      }
      if (req.body.radius_search != 'undefined') {
        user.radius_search = req.body.radius_search;
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
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
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
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
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
        })
        .exec(function(err, user) {
          console.log(err, user)
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
      let nodemailerMailgun = nodemailer.createTransport(mg(auth));
      let mailOptions = {
        from: 'support@yourdomain.com',
        to: user.email,
        subject: 'Your barbrdo password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
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
          // user.save(function(err) {
          //   res.send({
          //     token: generateToken(user),
          //     user: user
          //   });
          // });
        });
      }
    });
  });
};

exports.authGoogleCallback = function(req, res) {
  res.send('Loading...');
};

exports.addChair = function(req, res) {
  req.assert("_id", "_id is required").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let validateId = objectID.isValid(req.body._id)
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
          let totalNumberOfChairs = data.chairs.length;
          totalNumberOfChairs = totalNumberOfChairs + 1;
          let obj = {};
          let saveChair = [];
          obj.name = 'Chair' + " " + totalNumberOfChairs
          obj.availability = "closed";
          saveChair.push(obj);
          let saveChairData = {};
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
                msg: 'Chair successfully added.',
                data: success
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
      msg: 'id is not valid.'
    });
  }
}

exports.removeChair = function(req, res) {
  req.assert("shop_id", "Shop ID is required")
  req.assert("chair_id", "Chair ID is required");

  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log("req.body", req.body);
  let validateId = objectID.isValid(req.body.shop_id);
  let validateChairId = objectID.isValid(req.body.chair_id)
  if (validateId && validateChairId) {
    Shop.find({
      _id: req.body.shop_id,
      "chairs._id": req.body.chair_id
    }, {
      "chairs.$": 1
    }).exec(function(err, result) {
      if (err) {
        res.status(400).send({
          msg: 'Error in deleting chair.'
        });
      } else {
        if (result[0].chairs[0].barber_id) {
          res.status(400).send({
            msg: "You can't remove this chair.A Barber is already associated with this chair."
          });
        } else {
          Shop.update({
            _id: req.body.shop_id,
            "chairs._id": req.body.chair_id
          }, {
            $set: {
              "chairs.$.isActive": false,
              "chairs.$.availability": "closed"
            }
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
        }
      }
    })
  } else {
    res.status(400).send({
      msg: 'Please pass correct fields.'
    });
  }
}

exports.checkFaceBook = function(req, res) {
  req.assert('facebook_id', 'facebook_id is required').notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  User.find({
    "facebook": req.body.facebook_id
  }, function(err, response) {
    if (err) {
      res.status(400).send({
        msg: constantObj.messages.errorRetreivingData
      });
    } else {
      if (response.length > 0) {
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
    _id: req.params.id
  }, function(err, result) {
    if (result) {
      switch (result.user_type) {
        case 'shop':
          User.aggregate([{
            $match: {
              _id: id
            }
          }, {
            $lookup: {
              from: "shops",
              localField: "_id",
              foreignField: "user_id",
              as: "shop"
            }
          }]).exec(function(err, data) {
            if (err) {
              res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                "err": err
              });
            } else {
              res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                user: data[0]
              });
            }
          })
          break;
        case 'barber':
          User.aggregate([{
            $match: {
              _id: id
            }
          }, {
            $lookup: {
              from: "barbers",
              localField: "_id",
              foreignField: "user_id",
              as: "barber"
            }
          }]).exec(function(err, data) {
            if (err) {
              res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                "err": err
              });
            } else {
              res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                user: data[0]
              });
            }
          })
          break;
        case 'customer':
          User.aggregate([{
            $match: {
              _id: id
            }
          }, {
            $lookup: {
              from: "appointments",
              localField: "_id",
              foreignField: "customer_id",
              as: "appointments"
            }
          }]).exec(function(err, data) {
            if (err) {
              res.status(400).send({
                msg: constantObj.messages.errorRetreivingData,
                "err": err
              });
            } else {
              res.status(200).send({
                msg: constantObj.messages.successRetreivingData,
                user: data[0]
              });
            }
          })
          break;
      }
    } else {
      res.status(400).send({
        msg: "Please pass correct id"
      })
    }
  })
}

exports.activate = function (req, res) {
    console.log("req.body", req.body);
    if (req.body.email) {
        let email = commonObj.decrypt(req.body.email);
        let randomcode = req.body.randomString;
        console.log(email, randomcode)
        User.findOne({
            email: email,
            randomString: randomcode
        }).exec(function (err, user) {
            if (user.length > 1) {
                user.randomString = '';
                user.is_active = true;
                user.is_verified = true;
                user.remark = "";
                user.save(function (err) {
                    res.status(200).send({
                        msg: "You have successfully activated Your Account !  Please Login again to continue."
                    })
                });
            }else {
                User.findOne({
                    email: email,
                    is_active: true,
                    is_verified: true
                }).exec(function (err, user) {
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

/*exports.signupPostWeb = function(req, res, next) {
  req.assert('first_name', 'First name cannot be blank.').notEmpty();
  req.assert('last_name', 'Last name cannot be blank.').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('mobile_number', 'Mobile number cannot be blank').notEmpty();
  if (!req.body.facebook) {
    req.assert('password', 'Password must be at least 6 characters long').len(6);
  }
  req.assert('user_type', 'User type cannot be blank').notEmpty();
  if (req.body.user_type == 'shop' || req.body.user_type == 'barber') {
    req.assert('license_number', 'License number cannot be blank').notEmpty();
  }

  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });
  console.log("req.body", req.body);
  let errors = req.validationErrors();

  if (errors) {
    res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  let saveData = req.body;
  let email_encrypt = "";
  let generatedText = "";
  async.waterfall([
    function(done) {
      console.log("first callback .");
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
            saveData.device_type = req.headers.device_type;
          }
          if (req.headers.device_id) {
            saveData.device_id = req.headers.device_id;
          }
          if (req.headers.device_longitude && req.headers.device_latitude) {
            saveData.latLong = [req.headers.device_longitude, req.headers.device_latitude];
          }
          if (req.body.facebook) {
            saveData.isActive = true;
            saveData.is_verified = true;
            saveData.remark = '';
          }
          email_encrypt = commonObj.encrypt(req.body.email);
          generatedText = commonObj.makeid();
          saveData.randomString = generatedText;
          done(err, saveData)
        }
      })
    },
    function(saveData, done) {
      if (req.body.user_type == 'customer') {
        done(null, saveData)
      } else {
        stripe.customers.create({
            email: req.body.email,
            metadata: {
              user_type: req.body.user_type,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              mobile_number: req.body.mobile_number
            }
          },
          function(err, customer) {
            if (err) {
              return res.status(400).send({
                msg: "Error occurred on stripe.",
                "err": err
              })
            } else {
              console.log("customer created on stripe ", customer);
              saveData.isActive = true;
              saveData.is_verified = true;
              saveData.stripe_customer = customer;
              done(err, saveData)
            }
          })
      }
    },
    function(saveData, done) {
      User(saveData).save(function(err, data) {
        if (err) {
          return res.status(400).send({
            msg: constantObj.messages.errorInSave,
            "err": err
          })
        } else {
          let resetUrl = "http://" + req.headers.host + "/#/" + "account/verification/" + email_encrypt + "/" + generatedText;
          if (req.body.user_type == 'shop') {
            let saveDataForShop = {};
            saveDataForShop.user_id = data._id
            saveDataForShop.license_number = req.body.license_number;
            saveDataForShop.name = req.body.name;
            saveDataForShop.state = req.body.state;
            saveDataForShop.city = req.body.city;
            saveDataForShop.zip = req.body.zip;
            if (req.headers.device_longitude && req.headers.device_latitude) {
              saveDataForShop.latLong = [req.headers.device_longitude, req.headers.device_latitude];
              saveShop(saveDataForShop, resetUrl, data, req, res);
            } else if (req.body.zip) {
              geocoder.geocode(req.body.zip, function(errGeo, latlng) {
                if (errGeo) {
                  return res.status(400).send({
                    msg: constantObj.messages.errorInSave
                  })
                } else {
                  saveDataForShop.latLong = [latlng.results[0].geometry.location.lng, latlng.results[0].geometry.location.lat];
                  saveShop(saveDataForShop, resetUrl, data, req, res);
                }
              });
            } else {
              saveShop(saveDataForShop, resetUrl, data, req, res);
            }
          } else if (req.body.user_type == 'barber') {
            let saveDataForBarber = {};
            saveDataForBarber.user_id = data._id
            saveDataForBarber.license_number = req.body.license_number;
            Barber(saveDataForBarber).save(function(errSaveBarber, barberData) {
              if (errSaveBarber) {
                return res.status(400).send({
                  msg: constantObj.messages.errorInSave
                })
              } else {
                console.log("else part of barber save");
                res.send({
                  token: generateToken(data),
                  user: data.toJSON(),
                  "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
                });
                // accountActivateMailFunction(req, res, data, resetUrl)
              }
            })
          } else {
            accountActivateMailFunction(req, res, data, resetUrl)
          }
        }
      });
      done()
    }
  ]);
}
*/


exports.subscribe = function(req, res) {
  req.checkHeaders("user_id", "User id is required.").notEmpty();
  req.assert("token", "Plan is required.").notEmpty();
  req.assert("amount", "Plan is required.").notEmpty();
  let errors = req.validationErrors();
  if (errors) {
    return res.status(400).send({
      msg: "error in your request",
      err: errors
    });
  }
  console.log("subscribe", req.body);
  let amount = req.body.amount;
  User.findOne({
    _id: req.headers.user_id
  }).exec(function(err, data) {
    if (err) {
      res.status(400).send({
        msg: "This user is not present.",
        "err": err
      });
    } else {
      console.log("user_id", data);
      if (data) {
        console.log("data", data.email);
        stripe.customers.create({
            email: data.email,
            source: req.body.token
          })
          .then(customer =>
            stripe.charges.create({
              amount,
              description: "Sample Charge",
              currency: "usd",
              capture:false,
              customer: customer.id
            }))
          .then(function(charge) {
            console.log("subscription", charge);
            let updateData = {
              "$set": {
                isActive: true,
                is_verified: true,
                subscription:true,
                stripe_customer: charge.customer,
                stripe_subscription: charge
              }
            }
            User.update({
              _id: req.headers.user_id
            }, updateData, function(err, updateInfo) {
              if (err) {
                res.status(400).send({
                  msg: "Error occurred in subscription.",
                  "err": err
                });
              } else {
                User.findOne({
                  _id: req.headers.user_id
                }).exec(function(err, user) {
                  res.status(200).send({
                    "msg": "You are successfully subscribed."
                  });
                })
              }
            })
          });
      }
      /*else {
        stripe.customers.create({
          email: data.email,
          metadata: {
            user_type: data.user_type,
            first_name: data.first_name,
            last_name: data.last_name,
            mobile_number: data.mobile_number
          }
        }).then(function(customer) {
          let updateData = {
            "$set": {
              isActive: true,
              is_verified: true,
              stripe_customer: customer
            }
          }
          User.update({
            email: data.email
          }, updateData, function(err, updateInfo) {
            console.log("subscription user udpate err,updateInfo", err, updateInfo);
          })
          return stripe.customers.createSource(customer.id, {
            source: {
              object: 'card',
              exp_month: req.body.month,
              exp_year: req.body.year,
              number: req.body.card_number,
              cvc: req.body.cvc
            }
          });
        }).then(function(source) {
          return stripe.subscriptions.create({
            customer: customerId,
            plan: req.body.plan
          }, function(err, subscription) {
            if (err) {
              res.status(400).send({
                msg: "Error occurred in subscription.",
                "err": err
              });
            } else {
              console.log("subscription", subscription);
              User.update({
                _id: req.headers.user_id
              }, {
                $set: {
                  stripe_subscription: subscription
                }
              }, function(err, result) {
                if (err) {
                  res.status(400).send({
                    msg: "Error occurred in subscription.",
                    "err": err
                  });
                } else {
                  User.findOne({
                    _id: req.headers.user_id
                  }).exec(function(err, user) {
                    res.send({
                      token: generateToken(user),
                      user: user.toJSON(),
                      "imagesPath": "http://" + req.headers.host + "/" + "uploadedFiles/"
                    });
                  })
                }
              })
            }
          }).catch(function(err) {
            res.status(400).send({
              msg: "Error occurred in subscription.",
              "err": err
            });
          })
        }).then(function(charge) {

        }).catch(function(err) {

        });
      }*/
    }
  })
}



exports.stripeWebhook = function(req, res, next) {
  console.log(req.body);
  res.status(200).send({
    msg: "ok/"
  });
}