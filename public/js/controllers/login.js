angular.module('BarbrDoApp')
  .controller('LoginCtrl', function($scope, $rootScope, $location, $window, $auth) {
    $scope.user = {};
    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $('#login').modal('hide');
          $scope.user = {};
          console.log(response.data.url);
          $window.location = response.data.url;
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };
    $scope.modalDismiss = function(){
      $('#login').modal('hide');
    }
    $scope.signUpClick = function(){
      $('#login').modal('hide');
      $('#signup').modal('show');
    }
    $("#login").on("hide.bs.modal", function () {
        $scope.user.email = "";
        $scope.user.password = "";
        $scope.messages = {};
    });
    
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $('#login').modal('hide');
          $location.path('/');
        })
        .catch(function(response) {
          if (response.error) {
            $scope.messages = {
              error: [{ msg: response.error }]
            };
          } else if (response.data) {
            $scope.messages = {
              error: [response.data]
            };
          }
        });
    };
  });