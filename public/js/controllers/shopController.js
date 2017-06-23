angular.module('BarbrDoApp')
	.controller('shopCtrl', function($scope, $rootScope, $location, shop, $stateParams,$window,$state,toastr) {
		// var obj = JSON.parse($window.localStorage.user);
		$scope.shopData = JSON.parse($window.localStorage.user);
		$scope.shopInfo = function(){
			
		}

		$scope.chairrequest = function() {
			shop.chairRequest($window.localStorage.shop_id)
			.then(function(response) {
				$rootScope.requests = response.data.result;
			})
		}

		$scope.rejectrequest = function() {
			shop.declineRequest(chair).then(function(response) {
				console.log(response)
				toastr.success('Request is Declined successfully');
				$state.go('barbershopdashboard')
			})
		}

		if($state.current.name == 'barbershopdashboard'){
			shop.shopInfo().then(function(response){
				$scope.chairs = response.data.user;
				$window.localStorage.shop_id = response.data.user.shop[0]._id;
				$rootScope.shopinfo = response.data.user.shop[0];
			})
		}

		$scope.acceptrequest = function(chair) {
			shop.acceptRequest(chair).then(function(response) {
				console.log(response)
				toastr.success('Request is Accepted successfully');
				$state.go('barbershopdashboard')
			})
		}

		$scope.shopDashboard = function(){
			shop.shopInfo().then(function(response){
				$scope.chairs = response.data.user;
				$window.localStorage.shop_id = response.data.user.shop[0]._id;
				$rootScope.shopinfo = response.data.user.shop[0];
				console.log(response)
			})
		}
		if($state.current.name == 'chairaction'){
			$scope.chairId = $stateParams.name
			$scope.slider = {
			value: 50,
			options: {
				showSelectionBar: true,
				floor: 0,
				ceil: 100,
				ticksArray: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
			}
		};
		}
		$rootScope.$on("MyEvent", function(evt,data){ 
			$scope.shopDashboard();
		})
		$scope.saveSplitFair = function(type){
			console.log(type)
			let obj = {
				type: type,
				shop_percentage :$scope.slider.value,
				barber_percentage : 100-$scope.slider.value,
				chair_id:$stateParams.id
			}
			shop.saveSplitFair(obj).then(function(response){
				toastr.success('Split fair successfully saved.');
				$state.go('barbershopdashboard')
			})
		}
		$scope.saveWeeklyFair = function(type){
			let obj = {
				type: type,
				type :$scope.content,
				amount : $scope.priceValue,
				chair_id:$stateParams.id
			}
			shop.saveWeeklyFair(obj).then(function(response){
				toastr.success('Weekly fair successfully saved.');
				$state.go('barbershopdashboard')
			})
		}
		$scope.postToAllBarbers = function(){
			let obj = {
				chair_id:$stateParams.id
			}
			shop.postToAllBarbers(obj).then(function(response){
				toastr.success('Chair successfully posted to all barbers.');
				$state.go('barbershopdashboard')
			})
		}
		$scope.markBooked = function(){
			let obj = {
				chair_id:$stateParams.id
			}
			shop.markBooked(obj).then(function(response){
				toastr.success('Chair successfully Booked to non-barberdo barber.');
				$state.go('barbershopdashboard')
			})
		}
		$scope.deleteChair = function(){
			let obj = {
				chair_id:$stateParams.id,
				shop_id:$window.localStorage.shop_id
			}
			shop.deleteChair(obj).then(function(response){
				toastr.success('Chair successfully removed.');
				$state.go('barbershopdashboard')
			})
		}
	});