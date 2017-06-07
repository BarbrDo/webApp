angular.module('BarbrDoApp')
	.controller('barberCtrl', function($scope, $rootScope, $location, barber, $stateParams, $state, $window, toastr) {
		var objj = JSON.parse($window.localStorage.user);
		$scope.imgPath = $window.localStorage.imagePath;
		$scope.slider = {
			value: 50,
			options: {
				showSelectionBar: true,
				floor: 0,
				ceil: 100,
				ticksArray: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
			}
		};
		$scope.loaderStart = true;
		$scope.appointments = function() {
			barber.appointments()
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.pendingComplete = response.data.data;
					console.log($scope.pendingComplete);
				});
		}
		$scope.markers = [];
		$scope.map = {
			center: {
				latitude: 30.708225,
				longitude: 76.7029445
			},
			zoom: 4
		}
		if ($state.current.name == 'appointmentDetail') {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
			}
			barber.appointment(obj).then(function(response) {
				$scope.loaderStart = false;
				$scope.particularAppointment = response.data.data;
				$scope.totoalPrice = 0;
				if (response.data.data.services) {
					for (var i = 0; i < response.data.data.services.length; i++) {
						if (response.data.data.services[i].price) {
							totalPrice += response.data.data.services[i].price
						}
					}
				}
				var Markers = [{
					"id": "0",
					"coords": {
						"latitude": "30.708225",
						"longitude": "76.7029445"
					},
					"window": {
						"title": ""
					}
				}];
				$scope.markers = Markers;
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
		var obj = {
			'latitude': "30.708225",
			'longitude': "76.7029445"
		}
		$scope.allShopsHavingChairs = function() {
			$scope.loaderStart = true;
			barber.shopsHavingChairs(obj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.shopChairs = response.data.data;
				});
		}
		if ($state.current.name == 'shopChairs') {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
			}
			barber.shopChairs(obj).then(function(response) {
				$scope.loaderStart = false;
				$scope.particularShop = response.data.data;
			})
		}
		var myArray = [];
		// Below code is generating current date + 6 days more
		var date = new Date();
		myArray.push(date)
		for (var i = 1; i <= 6; i++) {
			var date = new Date();
			date.setDate(date.getDate() + i);
			myArray.push(date)
		}
		$scope.selectDate = myArray;
		$scope.setSelected = function(prop) {
			$scope.selectedDate = prop.toISOString().slice(0, 10);
		};
		$scope.changeObject = function(id) {
			$scope.chairId = id;
		}
		$scope.requestChair = function() {
			if ($scope.chairId) {
				$scope.loaderStart = true;
				var passObj = {
					shop_id: $stateParams._id,
					chair_id: $scope.chairId,
					barber_id: objj._id,
					barber_name: objj.first_name,
					booking_date: $scope.selectedDate
				}
				barber.requestChair(passObj).then(function(response) {
					$scope.loaderStart = false;
					toastr.success('Your request for chair is successfully saved');
				})
			} else {
				toastr.error('Please select date and chair');
			}

		}
		$scope.confirmAppointment = function(id) {
			console.log(id);
			var params = {
				"appointment_id": id
			}
			barber.confirmAppointment(params).then(function(response) {
				toastr.success('Your have confirmed a request');
				$scope.appointments();
			})
		}
		if ($state.current.name == 'rescheduleAppointment') {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
			}
			barber.appointment(obj).then(function(response) {
				$scope.loaderStart = false;
				$scope.appointmentData = response.data.data;
			})
		}
		$scope.timeReschedule = function(time) {
			if (time == 15 || time == 30 || time == 45) {
				var myobj = {
					minutes: time,
					appointment_id: $stateParams._id,
					appointment_date: $scope.appointmentData.appointment_date
				}
				console.log(myobj);
				barber.reschedule(myobj).then(function(response) {
					toastr.success('Your appointment is successfully rescheduled');
				})
			}
		}
		$scope.cancelAppointment = function() {
			var myobj = {
				appointment_id: $stateParams._id,
			}
			barber.cancelAppoint(myobj).then(function(response) {
				toastr.success('Your appointment is successfully canceled.');
			})
		}
		$scope.payNow = function(){
			toastr.warning('Work in progress.')
		}


		if ($state.current.name == 'manageservices' || $state.current.name == 'addservice' ) {
			$scope.loaderStart = true;
			barber.allServices().then(function(response) {
				$scope.loaderStart = false;
				$scope.servicesData = response.data.data
			})
		}
		$scope.saveServicesPrice = function(){
			toastr.warning("Work in progress.");
		}

	});