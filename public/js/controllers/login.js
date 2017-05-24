angular.module('BarbrDoApp')
  .controller('LoginCtrl', function($scope, $rootScope, $location, $window, $auth,$state) {
    $scope.user = {};
    $scope.messages = {};
    $scope.login = function() {
      $('#bs-example-modal-lg').modal('hide');
      $auth.login($scope.user)
        .then(function(response) {

         
          // $('body').removeClass('modal-open');
          // $('.modal-backdrop').remove();
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $scope.user = {};
          $state.go('dashboard');
        })
        .catch(function(response) {
          $('#bs-example-modal-lg').modal('show');
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
          setTimeout(function(){$scope.$apply()},1)
          console.log("sdfsdfsd",$scope.messages);
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