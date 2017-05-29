angular.module('BarbrDoApp')
	.controller('dashboardCtrl', function($scope, $rootScope, $location, customer, $stateParams,$state) {
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
					// alert(JSON.stringify(response.data))
					$scope.shops = response.data.data;
				});
		}

		$scope.allShopsHavingBarbers = function(id){
			$state.go('listBarbers',{_id: id});
		}

		if($stateParams._id){
			var obj = {_id:$stateParams._id}
			customer.shopContainsBarbers(obj).then(function(response){
				console.log(response.data.data);
			})
		}

		$scope.barberList = function() {
			customer.barberAll(obj)
				.then(function(response) {
					$scope.barbers = response.data.data;
				});
		}

		// $scope.shopdetails = function(shop) {
		// 	customer.barberList(shop)
		// 		.then(function(response) {
		// 			$rootScope.shopname = shop;
		// 			$rootScope.barbers = response.data.data.barber;
		// 		});
		// };
		
		// $scope.appointment = function(barber) {
		// 	customer.timeSlots(barber)
		// 		.then(function(response) {
		// 			$rootScope.time = response.data.data;
		// 			$rootScope.barber = barber;

		// 		});
		// 	customer.barberService(barber)
		// 		.then(function(response) {
		// 			$rootScope.barberservice = response.data.data;
		// 			$rootScope.barberdetail = barber;
		// 		});
		// };
		// $scope.cost = function(amt, e, value) {
		// 	if (e.target.checked) {
		// 		$scope.names = e.target.value;
		// 		$scope.dollarAmmount = $scope.dollarAmmount + amt;
		// 		$scope.selected.push(value);
		// 	} else {
		// 		$scope.dollarAmmount = $scope.dollarAmmount - amt;

		// 		for (var i = 0; i < $scope.selected.length; i++) {
		// 			if ($scope.selected[i]._id == value._id) {
		// 				$scope.selected.splice(i, 1);
		// 			}
		// 		}
		// 	}
		// 	$scope.annualCost = "$" + $scope.dollarAmmount;
		// };
		// $scope.timeslot = function(time) {
		// 	$rootScope.selectedtime = time;
		// 	console.log("selectedtime", time);
		// };
	});