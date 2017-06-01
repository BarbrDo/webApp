angular.module('BarbrDoApp')
	.controller('dashboardCtrl', function($scope, $rootScope, $location, customer, $stateParams, $state, $window, ngTableParams, $timeout) {
		$scope.dollarAmmount = 0.00;
		$scope.annualCost = "$" + $scope.dollarAmmount;
		var obj = {
			'latitude': "30.708225",
			'longitude': "76.7029445"
		}
		$scope.callFunctions = function() {
			$scope.shoplist();
			$scope.barberList();
		}
		$scope.shoplist = function() {
			customer.shopList(obj)
				.then(function(response) {
					$scope.shops = response.data.data;
				});
		}
		$scope.allShopsHavingBarbers = function(id) {
			$state.go('shopContainsBarbers', {
				_id: id
			});
		}
		if ($state.current.name == 'shopContainsBarbers') {
			var obj = {
				_id: $stateParams._id
			}
			customer.shopContainsBarbers(obj).then(function(response) {
				$scope.shopBarbers = response.data.data;
			})
		}
		if ($state.current.name == 'bookNow') {
			var passingObj = {
				_id: $stateParams.barber_id
			}
			customer.barberService(passingObj)
				.then(function(response) {
					$scope.barberservice = response.data.data;
				});

			var passObj = {
				"shop_id": $stateParams.shop_id,
				"barber_id": $stateParams.barber_id,
				"latitude": "30.708225",
				'longitude': "76.7029445"
			}

			customer.bookNowPageInfo(passObj)
				.then(function(response) {
					$scope.barberInformation = response.data.data;
				});

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
			// timeSlots defines in costant file
			$scope.timeSlots = timeSlots;
		}
		$scope.setSelected = function(prop) {
			$scope.selectedDate = prop.toISOString().slice(0, 10);
		};
		$scope.setSelectedTime = function(prop) {
			$scope.choosedTime = prop;
		};
		$scope.barberList = function() {
			customer.barberAll(obj)
				.then(function(response) {
					$scope.barbers = response.data.data;
				});
		}
		$scope.selection = [];
		$scope.toggleSelection = function toggleSelection(fruitName) {
			var idx = $scope.selection.indexOf(fruitName);
			// Is currently selected
			if (idx > -1) {
				$scope.selection.splice(idx, 1);
			} else {
				$scope.selection.push({
					name: fruitName.name,
					price: fruitName.price
				});
				console.log($scope.selection);
			}
		};
		$scope.payLater = function() {
			var postObj = {
				"shop_id": $stateParams.shop_id,
				"barber_id": $stateParams.barber_id,
				"services": $scope.selection,
				"appointment_date": $scope.selectedDate + " " + $scope.choosedTime,
				"payment_method": "cash",
			}
			customer.takeAppointment(postObj)
				.then(function(response) {
					$state.go('pending', {
						_id: response.data.data._id
					});
				});
		}
		$scope.appointments = function() {
			$scope.loaderStart = true;
			$scope.tableParams = new ngTableParams({
				page: 1,
				count: 10,
				sorting: {
					created: "desc"
				}
			}, {
				counts: [],
				getData: function($defer, params) {
					customer.fetchAppointments().then(function(response) {
						$scope.loaderStart = false;
						$scope.data = response.data;
						$defer.resolve($scope.data);
					})
				}
			})
		}
			$scope.markers = [];
			$scope.map = {
				center: {
					latitude: 30.708225,
					longitude: 76.7029445
				},
				zoom: 4
		}
		if ($state.current.name == 'pending') {
			var passingObj = {
				_id: $stateParams._id
			}
			customer.pendingConfirmation(passingObj)
				.then(function(response) {
					$scope.pendingData = response.data.data;
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
				});
		}
		$scope.passMapdata = function(data) {
			console.log(data);

		}
	});