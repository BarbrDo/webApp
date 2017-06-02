angular.module('BarbrDoApp', ['ui.router', 'satellizer', 'slick', 'oc.lazyLoad', 'ngMask', 'ui.bootstrap','ngTable','alexjoffroy.angular-loaders','uiGmapgoogle-maps','rzModule'])
 .config(
    ['uiGmapGoogleMapApiProvider', function(GoogleMapApiProviders) {
        GoogleMapApiProviders.configure({
            china: true
        });
    }])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $authProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    "home": {
                        templateUrl: 'partials/home.html',
                        controller: 'HeaderCtrl'
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html'
                    },
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: 'HeaderCtrl'
                    }
                },
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated
                }
            })
            .state('barberHome', {
                url: '/barber',
                views: {
                    "home": {
                        templateUrl: 'partials/barbersHome.html',
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html'
                    },
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: 'HeaderCtrl'
                    }
                },
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                views: {
                    "homeDash": {
                        templateUrl: 'partials/dashboard.html',
                        controller: "dashboardCtrl"
                    },
                    "header": {
                        templateUrl: 'partials/headerAfterLogin.html',
                        controller: "HeaderCtrl"
                    },
                    "sideBar": {
                        templateUrl: 'partials/afterLoginSideBar.html'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function ($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['js/controllers/dashboard.js',
                                'js/services/customer.js'
                            ]
                        }).then(function () {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }],
                    loginRequired: loginRequired
                }
            })
            .state('shopContainsBarbers', {
                url: '/shopContainsBarbers/:_id',
                params: {
                    _id: null
                },
                views: {
                    "homeDash": {
                        templateUrl: 'partials/shopHavingBarbers.html',
                        controller: "dashboardCtrl"
                    },
                    "header": {
                        templateUrl: 'partials/headerAfterLogin.html',
                        controller: "HeaderCtrl"
                    },
                    "sideBar": {
                        templateUrl: 'partials/afterLoginSideBar.html'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function ($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['/js/controllers/dashboard.js',
                                '/js/services/customer.js'
                            ]
                        }).then(function () {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }],
                    loginRequired: loginRequired
                }
            })

        .state('bookNow', {
            url: '/book/:shop_id/:barber_id',
            params: {
                shop_id: null,
                barber_id: null
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/book_now.html',
                    controller: "dashboardCtrl"
                },
                "header": {
                    templateUrl: 'partials/headerAfterLogin.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/afterLoginSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function ($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['/js/controllers/dashboard.js',
                            '/js/services/customer.js'
                        ]
                    }).then(function () {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }],
                loginRequired: loginRequired
            }
        })

        .state('barberDashboard', {
            url: '/designDashboardOfBarber',
            views: {
                "homeDash": {
                    templateUrl: 'partials/barberDashboard.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "barberCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function ($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/barberController.js',
                            'js/services/customer.js'
                        ]
                    }).then(function () {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }],
                loginRequired: loginRequired
            }
        })


        .state('appointmentDetail', {
            url: '/appointmentdetail',
            views: {
                "homeDash": {
                    templateUrl: 'partials/appointment_detail.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "barberCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('appointmentDetailconfirm', {
            url: '/appointmentdetailconfirm',
            views: {
                "homeDash": {
                    templateUrl: 'partials/appointment_detail_confirm.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "barberCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('sendinvitation', {
            url: '/sendinvitation',
            views: {
                "homeDash": {
                    templateUrl: 'partials/sendinvitation.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "barberCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('searchchair', {
            url: '/searchchair',
            views: {
                "homeDash": {
                    templateUrl: 'partials/searchchair.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "barberCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('barbershopdashboard', {
            url: '/barbershopdashboard',
            views: {
                "homeDash": {
                    templateUrl: 'partials/barbershopdashboard.html'
                },
                "header": {
                    templateUrl: 'partials/barber_shop_header.html',
                    controller: "barberCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barbershopSideBar.html'
                }
            }
        })
        
        
        .state('chairaction', {
            url: '/chairaction',
            views: {
                "homeDash": {
                    templateUrl: 'partials/chairaction.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_shop_header.html',
                    controller: "barberCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barbershopSideBar.html'
                }
            },
            resolve: {
                    lazy: ['$ocLazyLoad', '$q', function ($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['js/controllers/barberController.js',
                                'js/services/customer.js'
                            ]
                        }).then(function () {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }],
                    loginRequired: loginRequired
                }
        })   
    .state('upcomingComplete', {
        url: '/home',
        views: {
          "homeDash": {
            templateUrl: 'partials/customer_upcoming_completed.html',
            controller: "dashboardCtrl"
          },
          "header": {
            templateUrl: 'partials/headerAfterLogin.html',
            controller: "HeaderCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/afterLoginSideBar.html'
          }
        },
        resolve: {
          lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: 'BarbrDoApp',
              files: ['js/controllers/dashboard.js',
                'js/services/customer.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }],
          loginRequired: loginRequired
        }
      })

     .state('contact', {
                url: '/contact',
                templateUrl: 'partials/contact.html',
                controller: 'ContactCtrl'
            })
        
            .state('account', {
                url: '/account',
                templateUrl: 'partials/profile.html',
                controller: 'ProfileCtrl',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('shop', {
                url: '/shop',
                templateUrl: './../profile.html',
                controller: 'shopCtrl',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('forgot', {
                url: '/forgot',
                templateUrl: 'partials/forgot.html',
                controller: 'ForgotCtrl',
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated
                }
            })
            .state('resetToken', {
                url: '/reset/:token',
                templateUrl: 'partials/reset.html',
                controller: 'ResetCtrl',
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated
                }
            })
            .state('barberShops', {
                url: '/barbershops',
                templateUrl: 'partials/barbershops.html',
                controller: 'ShopCtrl'
            })
            .state('barbers', {
                url: '/barbers',
                templateUrl: 'partials/barbers.html',
                controller: 'ShopCtrl'
            })
            .state('pageNotFound', {
                url: '/partials',
                templateUrl: 'partials/404.html'
            })
    .state('pending', {
      url: '/pending-confirmation/:_id',
      params:{
        _id:null
      },
      views: {
          "homeDash": {
            templateUrl: 'partials/pending_confirmation.html',
            controller: "dashboardCtrl"
          },
          "header": {
            templateUrl: 'partials/headerAfterLogin.html',
            controller: "HeaderCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/afterLoginSideBar.html'
          }
        },
        resolve: {
          lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: 'BarbrDoApp',
              files: ['/js/controllers/dashboard.js',
                '/js/services/customer.js'
              ]
            }).then(function() {
              deferred.resolve();
            });
            return deferred.promise;
          }],
          loginRequired: loginRequired
        }
      })
    
    .state('requestchair', {
        url: '/requestchair',
        views: {
          "homeDash": {
            templateUrl: 'partials/requestchair.html'
          },
          "header": {
            templateUrl: 'partials/barber_header_after_login.html',
            controller: "barberCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/barberSideBar.html'
          }
        }
      })
    
    .state('sendrequestchair', {
        url: '/sendrequestchair',
        views: {
          "homeDash": {
            templateUrl: 'partials/sendrequestchair.html'
          },
          "header": {
            templateUrl: 'partials/barber_header_after_login.html',
            controller: "barberCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/barberSideBar.html'
          }
        }
      })

     .state('requestchairsent', {
        url: '/requestchairsent',
        views: {
          "homeDash": {
            templateUrl: 'partials/requestchairsent.html'
          },
          "header": {
            templateUrl: 'partials/barber_header_after_login.html',
            controller: "barberCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/barberSideBar.html'
          }
        }
      })

     .state('managerequest', {
        url: '/managerequest',
        views: {
          "homeDash": {
            templateUrl: 'partials/managerequest.html'
          },
          "header": {
            templateUrl: 'partials/barber_header_after_login.html',
            controller: "barberCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/barberSideBar.html'
          }
        }
      })    
 
 
    .state('manageservices', {
        url: '/manageservices',
        views: {
          "homeDash": {
            templateUrl: 'partials/manageservices.html'
          },
          "header": {
            templateUrl: 'partials/barber_header_manage_services.html',
            controller: "barberCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/barberSideBar.html'
          }
        }
      })
    .state('addservice', {
        url: '/addservice',
        views: {
          "homeDash": {
            templateUrl: 'partials/addservice.html'
          },
         "header": {
                templateUrl: 'partials/barber_shop_header.html',
                controller: "barberCtrl"
            },
          "sideBar": {
            templateUrl: 'partials/barberSideBar.html'
          }
        }
      })
    .state('barbershop_manage_request', {
        url: '/barbershop_manage_request',
        views: {
          "homeDash": {
            templateUrl: 'partials/barbershop_manage_request.html'
          },
          "header": {
                templateUrl: 'partials/barber_shop_header.html',
                controller: "barberCtrl"
            },
          "sideBar": {
            templateUrl: 'partials/barbershopSideBar.html'
          }
        }
      })
     
        
    .state('financialcenter', {
        url: '/financialcenter',
        views: {
          "homeDash": {
            templateUrl: 'partials/financialcenter.html'
          },
          "header": {
                templateUrl: 'partials/barber_shop_header.html',
                controller: "barberCtrl"
            },
          "sideBar": {
            templateUrl: 'partials/barbershopSideBar.html'
          }
        }
      })
        
        
        
     .state('contactbarbrDO', {
        url: '/contactbarbrDO',
        views: {
          "homeDash": {
            templateUrl: 'partials/contactbarbrDO.html'
          },
          "header": {
                templateUrl: 'partials/barber_shop_header.html',
                controller: "barberCtrl"
            },
          "sideBar": {
            templateUrl: 'partials/barbershopSideBar.html'
          }
        }
      });
        
        
        
        
        

    $urlRouterProvider.otherwise('pageNotFound');
    $authProvider.loginUrl = '/api/v1/login';
    $authProvider.signupUrl = '/api/v1/signup';
    $authProvider.facebook({
      url: '/auth/facebook',
      clientId: '653227411528324'
    });
    $authProvider.google({
      url: '/auth/google',
      clientId: '73291812238-aekh50otlf7b5duqanlvo2q1p2o8e4m9.apps.googleusercontent.com'
    });

    function skipIfAuthenticated($state, $auth, $q) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        setTimeout(function() {
          deferred.resolve()
          $state.go('dashboard');
        }, 0);
        return deferred.promise;
      }
    }

    function loginRequired($state, $auth, $q) {
      // console.log("loginRequired", $auth.isAuthenticated());
      var deferred = $q.defer();
      if (!$auth.isAuthenticated()) {
        setTimeout(function() {
          deferred.resolve()
          $state.go('home');
        }, 0);
        return deferred.promise;
      }
    }
    
    
  })

.directive('checkImage', function($http) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            attrs.$observe('ngSrc', function(ngSrc) {
              console.log("ngSrc",ngSrc);
                $http.get(ngSrc).success(function(response){
                    console.log("response in appjs",response);
                }).error(function(){
                    // alert('image not exist');
                    element.attr('src', 'http://dhakaprice.com/images/No-image-found.jpg'); // set default image
                });
            });
        }
    };
});
  // .run(function($rootScope, $window) {
  //   if ($window.localStorage.user) {
  //     $rootScope.currentUser = JSON.parse($window.localStorage.user);
  //   }
  // });

