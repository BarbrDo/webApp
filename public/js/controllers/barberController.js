angular.module('BarbrDoApp')
	.controller('barberCtrl', function($scope, $rootScope, $location, barber, $stateParams, $state) {
		$scope.slider = {
			value: 10,
			options: {
				showSelectionBar: true
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
	});