angular.module('BarbrDoApp')
	.controller('shopCtrl', function($scope, $rootScope, $location, shop, $stateParams,$window,$state,toastr) {
		// var obj = JSON.parse($window.localStorage.user);
		$scope.myobj = {};
		
		$scope.shopData = JSON.parse($window.localStorage.user);
		$scope.shopInfo = function(){
			
		}

		$scope.chairrequest = function() {
			$scope.loaderStart = true;
			shop.chairRequest($window.localStorage.shop_id)
			.then(function(response) {
				$scope.loaderStart = false;
				$rootScope.requests = response.data.result;
			})
		}

		$scope.searchbarber = function() {
			$scope.loaderStart = true;
			var passingObj = {};
			 if ($scope.myobj.search) {
		      passingObj.search = $scope.myobj.search
		    }
			shop.barbers(passingObj)
		      .then(function(response) {
		      	$scope.loaderStart = false;
		        $rootScope.barbers = response.data.data;
		      });
		}

		$scope.requesterdetails = function() {
			$scope.loaderStart = true;
				shop.barberDetail($stateParams.id)
					.then(function(response) {
						$scope.loaderStart = false;
						$rootScope.requester = response.data.data[0];
					});

		};

		$scope.nobarbers = function() {
			toastr.info('No Barber in the Chair');
		}


		$scope.requestbarber = function(barber) {
				shop.requestBarber($window.localStorage.shop_id,$stateParams.id,barber)
					.then(function(response) {
						toastr.success('Request is Sended to the barber successfully ! Check Your Mail');
						$state.go('chairaction');
						console.log(response)
					});

		};

		$scope.rejectrequest = function(chair) {
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
				console.log(response.data.user.shop[0])
			})
		}

		$scope.acceptrequest = function(chair) {
			shop.acceptRequest(chair).then(function(response) {
				toastr.success('Request is Accepted successfully');
				$state.go('barbershopdashboard')

			})
		}

		$scope.shopDashboard = function(){
			shop.shopInfo().then(function(response){
				$scope.chairs = response.data.user;
				$window.localStorage.shop_id = response.data.user.shop[0]._id;
				$rootScope.shopinfo = response.data.user.shop[0];
				
			})
		}
		if($state.current.name == 'chairaction'){
			$scope.chairName = $stateParams.name
			$scope.chairId = $stateParams.id
			$scope.slider = {
			value: 0,
			options: {
				showSelectionBar: true,
				floor: 0,
				ceil: 100,
				step: 10,
				ticksArray: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
			}
		};
		}

		if($state.current.name == 'chairwithbarber'){
			$scope.chairName = $stateParams.name
			$scope.chairId = $stateParams.id
			
		};

		$scope.chairdetails = function()
		{
			shop.chairDetail($stateParams.id)
			.then(function(response) {
				$rootScope.chairs = response.data.data[0].chairs[0];
			})
		}

		$rootScope.$on("MyEvent", function(evt,data){ 
			$scope.shopDashboard();
		})
		$scope.saveSplitFair = function(type){
			var obj = {
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
			var obj = {
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
			var obj = {
				chair_id:$stateParams.id
			}
			shop.postToAllBarbers(obj).then(function(response){
				toastr.success('Chair successfully posted to all barbers.');
				$state.go('barbershopdashboard')
			})
		}
		$scope.markBooked = function(){
			var obj = {
				chair_id:$stateParams.id
			}
			shop.markBooked(obj).then(function(response){
				toastr.success('Chair successfully Booked to non-barberdo barber.');
				$state.go('barbershopdashboard')
			})
		}
		$scope.deleteChair = function(){
			var obj = {
				chair_id:$stateParams.id,
				shop_id:$window.localStorage.shop_id
			}
			shop.deleteChair(obj).then(function(response){
				toastr.success('Chair successfully removed.');
				$state.go('barbershopdashboard')
			})
		}
	});