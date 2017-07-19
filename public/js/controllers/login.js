angular.module('BarbrDoApp')
  .controller('LoginCtrl', function($scope, $rootScope, $location, $window, $auth,$state) {
    $scope.user = {};
    $scope.messages = {};
    $scope.login = function() {
      // $('#bs-example-modal-lg').modal('hide');
      $('#bs-example').modal('hide');
      $auth.login($scope.user)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $scope.user = {};
          if(response.data.user.user_type =='customer'){
            $state.go('dashboard');
          }
          if(response.data.user.user_type =='barber'){
            $state.go('barberDashboard');
          }     
        })
        .catch(function(response) {
           $('#bs-example').modal('show');
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
          setTimeout(function(){
            $scope.$apply()},1)
        });
    };
    
    
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