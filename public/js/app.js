angular.module('BarbrDoApp', ['ui.router', 'satellizer', 'slick', 'oc.lazyLoad','ngMask','ui.bootstrap'])
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
          },
          "footer": {
            templateUrl: 'partials/footer.html'
          },
          "header": {
            templateUrl: 'partials/header.html',
            controller:'HeaderCtrl'
          }
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
            controller:'HeaderCtrl'
          }
        }
      })

      $stateProvider
      .state('dashboard', {
        url: '/dashboard',
        views: {
          "home": {
            templateUrl: 'partials/dashboard.html',
          },
          "header": {
            templateUrl: 'partials/headerAfterLogin.html',
            controller:'HeaderCtrl'
          },
          "sideBar":{
            templateUrl:'partials/afterLoginSideBar.html'
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
      // .when('/shopdetails/:id', {
      //   templateUrl: 'partials/shopdetails.html',
      //   controller: 'ShopCtrl'
      // })
      // .when('/appointment/:id', {
      //   templateUrl: 'partials/appointment.html',
      //    controller: 'AppointCtrl'
      // })
      // .when('/pay/:id', {
      //   templateUrl: 'partials/pay.html',
      //    controller: 'AppointCtrl'
      // })
      // .when('/confirm', {
      //   templateUrl: 'partials/confirm.html',
      //    controller: 'AppointCtrl'
      // })
      //  .when('/barberprofile/:id', {
      //   templateUrl: 'partials/barberprofile.html',
      //    controller: 'BarbrCtrl'
      // })
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

    function skipIfAuthenticated($location, $auth) {
      if ($auth.isAuthenticated()) {
        $location.path('/');
      }
    }

    function loginRequired($location, $auth) {
      if (!$auth.isAuthenticated()) {
        $location.path('/login');
      }
    }
  })
  // .run(function($rootScope, $window) {
  //   if ($window.localStorage.user) {
  //     $rootScope.currentUser = JSON.parse($window.localStorage.user);
  //   }
  // });