angular.module('BarbrDoApp')
  .controller('barbrHeaderCtrl', function($scope, $location, $window, $auth, $state) {
    $scope.isActive = function(viewLocation) {
      return viewLocation === $location.path();
    };
  
    $scope.mainClass = function(){
      if ($auth.isAuthenticated()) {
        return "bg_grey";
      }
      else{
        return
      }
    }

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    $scope.checkState = function(state) {
      if ($state.current.name == state) {
        return true;
      } else {
        return false;
      }
    }

    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $state.go('home');
    };
  });