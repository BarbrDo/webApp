angular.module('BarbrDoApp')
  .controller('ForgotCtrl', function($scope,$stateParams, $state,Account,toastr,$auth) {
    
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
