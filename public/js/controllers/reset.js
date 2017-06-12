angular.module('BarbrDoApp')
  .controller('ResetCtrl', function($scope, Account,$stateParams) {
    $scope.resetPassword = function() {
      $scope.user.token = $stateParams.token;
      console.log($scope.user);
      Account.resetPassword($scope.user)
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
    }
  });
