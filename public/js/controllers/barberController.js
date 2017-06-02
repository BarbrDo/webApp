angular.module('BarbrDoApp')

	.controller('barberCtrl', function($scope, $rootScope, $location, barber, $stateParams, $state) {
		  $scope.slider = {
            value: 50 ,
             options: {
                 showSelectionBar: true,
            floor: 0,
            ceil: 100,
            ticksArray: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
          }
        };
		$scope.loaderStart = true;
		barber.appointments()
			.then(function(response) {
				$scope.loaderStart = false;
				$scope.pendingComplete = response.data.data;
				console.log($scope.pendingComplete);
			});
		if ($state.current.name == 'appointmentDetail') {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
			}
			barber.appointment(obj).then(function(response) {
				$scope.loaderStart = false;
				$scope.particularAppointment = response.data.data;
			})
		}
    
     $scope.data = {
    cb1: true,
    cb4: true,
    cb5: false
  };

  $scope.message = 'false';

  $scope.onChange = function(cbState) {
  	$scope.message = cbState;
  };
    
    
    
    
	});