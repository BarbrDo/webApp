angular.module('BarbrDoApp', ['ui.router', 'satellizer', 'slick', 'oc.lazyLoad', 'ngMask', 'ui.bootstrap'])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $authProvider) {
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
            controller:'HeaderCtrl'
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

    .state('listBarbers', {
      url: '/shopContainsBarbers/:_id',
      params:{
        _id:null
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
          lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            var deferred = $q.defer();
            $ocLazyLoad.load({
              name: 'BarbrDoApp',
              files: ['js/controllers/barberController.js',
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
            templateUrl: 'partials/barber_header_after_login.html',
            controller: "barberCtrl"
          },
          "sideBar": {
            templateUrl: 'partials/barberSideBar.html'
          }
        }
      })      
 
    
    
    
    
    
    

    .state('contact', {
        url: '/contact',
        templateUrl: 'partials/contact.html',
        controller: 'ContactCtrl'
      })
      // .when('/login', {
      //   templateUrl: 'partials/login.html',
      //   controller: 'LoginCtrl',
      //   resolve: { skipIfAuthenticated: skipIfAuthenticated }
      // })
      // .when('/signup', {
      //   templateUrl: 'partials/signup.html',
      //   controller: 'SignupCtrl',
      //   resolve: { skipIfAuthenticated: skipIfAuthenticated }
      // })
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
  // .run(function($rootScope, $window) {
  //   if ($window.localStorage.user) {
  //     $rootScope.currentUser = JSON.parse($window.localStorage.user);
  //   }
  // });