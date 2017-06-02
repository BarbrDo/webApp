angular.module('BarbrDoApp')
	.controller('barberCtrl', function($scope, $rootScope, $location, customer, $stateParams,$state) {
//		$scope.dollarAmmount = 0.00;
		//console.log("barber controller is working");
  $scope.slider = {
    value: 50 ,
     options: {
         showSelectionBar: true,
    floor: 0,
    ceil: 100,
    ticksArray: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
};
	});