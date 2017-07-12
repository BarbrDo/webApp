angular.module('BarbrDoApp')
  .controller('ForgotCtrl', function($scope,$stateParams, $state,Account,toastr,$auth) {
    $scope.forgotPassword = function() {
      console.log("here in forgot")
      Account.forgotPassword($scope.user)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };
    if($state.current.name == 'accountActivate'){
      $scope.loaderStart = true;
      let obj = {
        email: $stateParams.email,
        randomString:$stateParams.random
      }
      Account.activateAccount(obj).then(function(response){
        toastr.success('You have successfully activated your account.Please Login again.');
        $auth.logout();
        delete $window.localStorage.user;
        $state.go('home')
      })
    }
  });
