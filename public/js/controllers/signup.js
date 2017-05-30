angular.module('BarbrDoApp')
  .controller('SignupCtrl', function($scope, $rootScope, $location, $window, $auth) {
    $scope.messages = {};
    $scope.active={val:0};
    $scope.changeTab = function(tab){
      console.log('tab',tab);
      $scope.active.val = tab;
    }
    $scope.signup = function() {
      $('#bs-example-modal-lg').modal('hide');
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $scope.user = {};
          $location.path('/');
        })
        .catch(function(response) {
          $('#bs-example-modal-lg').modal('show');
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : response.data
          };
        });
    };

    $("#signup").on("hide.bs.modal", function () {
      setTimeout(function(){$scope.$apply()},1)
        $scope.user = {};
        $scope.messages = {};
    });

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
           $('#signup').modal('hide');
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
    $scope.loginModal = function(){
       $('#signup').modal('hide');
      $('#login').modal('show');
    }
    $scope.hideModal = function(){
      $('#signup').modal('hide');
    }
  });