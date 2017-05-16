angular.module('BarbrDoApp', ['ngRoute', 'satellizer','slick'])
  .config(function($routeProvider, $locationProvider, $authProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/contact', {
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
      .when('/account', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
          loginRequired: loginRequired
        }
      })
      .when('/shop', {
        templateUrl: './../profile.html',
        controller: 'shopCtrl',
        resolve: {
          loginRequired: loginRequired
        }
      })
      .when('/forgot', {
        templateUrl: 'partials/forgot.html',
        controller: 'ForgotCtrl',
        resolve: {
          skipIfAuthenticated: skipIfAuthenticated
        }
      })
      .when('/reset/:token', {
        templateUrl: 'partials/reset.html',
        controller: 'ResetCtrl',
        resolve: {
          skipIfAuthenticated: skipIfAuthenticated
        }
      })

    .when('/barbershops', {
        templateUrl: 'partials/barbershops.html',
        controller: 'ShopCtrl'
      })
    .when('/barbers', {
        templateUrl: 'partials/barbers.html',
        controller: 'ShopCtrl'
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
    .otherwise({
      templateUrl: 'partials/404.html'
    });

  // .config(function($stateProvider, $locationProvider, $authProvider) {
  //   $locationProvider.html5Mode(true);

  //   $stateProvider.state('home1', {
  //       url:'/',
  //       templateUrl: 'partials/home.html'
  //     })
  //     .state('contact',{
  //       url:'/contact',
  //       templateUrl: 'partials/contact.html',
  //       controller: 'ContactCtrl'
  //     })
  //     .state('login',{
  //       url:'/login',
  //      templateUrl: 'partials/login.html',
  //       controller: 'LoginCtrl',
  //       resolve: { skipIfAuthenticated: skipIfAuthenticated }
  //     })
  //     .state('signup',{
  //       url:'/signup',
  //      templateUrl: 'partials/signup.html',
  //       controller: 'SignupCtrl',
  //       resolve: { skipIfAuthenticated: skipIfAuthenticated }
  //     })
  //     .state('account',{
  //       url:'/account',
  //      templateUrl: 'partials/profile.html',
  //       controller: 'ProfileCtrl',
  //       resolve: {
  //         loginRequired: loginRequired
  //       }
  //     })
  //     .state('forgot',{
  //       url:'/forgot',
  //       templateUrl: 'partials/forgot.html',
  //       controller: 'ForgotCtrl',
  //       resolve: {
  //         skipIfAuthenticated: skipIfAuthenticated
  //       }
  //     })
  //    .state('reset',{
  //       url:'/reset/:token',
  //       templateUrl: 'partials/reset.html',
  //       controller: 'ResetCtrl',
  //       resolve: {
  //         skipIfAuthenticated: skipIfAuthenticated
  //       }
  //     })
  //     .state('barbershops',{
  //       url:'/barbershops',
  //        templateUrl: 'partials/barbershops.html',
  //       controller: 'ShopCtrl'
  //     })
  //     .state('shopdetails',{
  //       url:'/shopdetails/:id',
  //       templateUrl: 'partials/shopdetails.html',
  //       controller: 'ShopCtrl'
  //     })
  //     .state('appointment',{
  //       url:'/appointment/:id',
  //        templateUrl: 'partials/appointment.html',
  //        controller: 'AppointCtrl'
  //     })
  //     .state('pay',{
  //       url:'/pay/:id',
  //         templateUrl: 'partials/pay.html',
  //        controller: 'ShopCtrl'
  //     })
  //     .state('confirm',{
  //       url:'/confirm/:id',
  //          templateUrl: 'partials/confirm.html',
  //        controller: 'AppointCtrl'
  //     })
  //     .state('barberprofile',{
  //       url:'/barberprofile/:id',
  //         templateUrl: 'partials/barberprofile.html',
  //        controller: 'BarbrCtrl'
  //     })
  //   .otherwise({
  //     templateUrl: 'partials/404.html'
  //     });

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

