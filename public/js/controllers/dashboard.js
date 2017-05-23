angular.module('BarbrDoApp')
  .controller('dashboardCtrl', function($scope, $rootScope, $location) {
    $scope.valueSelect = function(){
      console.log("working",$scope.valueOfSelect);
    }
  });