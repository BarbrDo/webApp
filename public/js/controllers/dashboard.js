angular.module('BarbrDoApp')
	.controller('dashboardCtrl', function($scope, $rootScope, $location, customer, $stateParams, $state, $window, ngTableParams, $timeout, $http) {
		$scope.dollarAmmount = 0.00;
		$scope.annualCost = "$" + $scope.dollarAmmount;
		$scope.search = {};
		var obj = {
			'latitude': "40.658801",
			'longitude': "-74.1063776"
		}
		$scope.callFunctions = function() {
				$scope.shoplist();
				$scope.barberList();
			}
			// $scope.searchBarber = "";
			// $scope.searchShop = "";
		$scope.shoplist = function() {
			obj.search = $scope.search.searchShop;
			$scope.loaderStart = true;
			customer.shopList(obj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.shops = response.data.data;
				});
		}
		$scope.dateSelectClass = function(index){
			if($scope.selectedDate){	
			 return {
			  active:index>$scope.selectDate.length / 2 - 1
			 }
			}
		}
		$scope.allShopsHavingBarbers = function(id) {
			$state.go('shopContainsBarbers', {
				_id: id
			});
		}
		if ($state.current.name == 'shopContainsBarbers') {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
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

			customer.shopContainsBarbers(obj).then(function(response) {
				$scope.loaderStart = false;
				$scope.shopBarbers = response.data.data;
			})
		}
		if ($state.current.name == 'bookNow') {
			$scope.loaderStart = true;
			var passingObj = {
				_id: $stateParams.barber_id
			}
			customer.barberService(passingObj)
				.then(function(response) {
					$scope.loaderStart = false;
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
		$scope.selecteddd = 0;
		$scope.setSelected = function(prop, index) {
			$scope.selectedDate = prop.toISOString().slice(0, 10);
			$scope.selecteddd = index; 
		};
		$scope.setSelectedTime = function(prop,index) {
			$scope.choosedTime = prop;
			$scope.selectedTime = index
		};
		$scope.barberList = function() {
			obj.search = $scope.search.searchBarber;
			$scope.loaderStart = true;
			customer.barberAll(obj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.barbers = response.data.data;
				});
		}
		$scope.selection = {};
		$scope.totalMoney = 0;
		$scope.selected = [];

		$scope.cost = function(amt, e, value) {
			if (e.target.checked) {
				$scope.names = e.target.value;
				$scope.dollarAmmount = $scope.dollarAmmount + amt;
				$scope.selected.push(value);
			} else {
				$scope.dollarAmmount = $scope.dollarAmmount - amt;
				for (var i = 0; i < $scope.selected.length; i++) {
					if ($scope.selected[i]._id == value._id) {
						$scope.selected.splice(i, 1);
					}
				}
			}
			$scope.annualCost = "$" + $scope.dollarAmmount;
		};

		$scope.payLater = function() {
			console.log($scope.selected);
			var myarr = [];
			for (var i = 0; i < $scope.selected.length; i++) {
				var cusObj = {};
				cusObj.name = $scope.selected[i].name;
				cusObj.price = $scope.selected[i].price;
				myarr.push(cusObj);
			}
			var postObj = {
				"shop_id": $stateParams.shop_id,
				"barber_id": $stateParams.barber_id,
				"services": myarr,
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
					$scope.time = response.data.data.appointment_date.substring(11, 19);
					var sum = 0;
					var len = response.data.data.barber_id.ratings.length;
					for(var i=0;i<len;i++){
						sum+= response.data.data.barber_id.ratings[i].score
					}
					$scope.ratingBarber = sum/len
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
		$scope.uploadImage = function() {
			var fs = new FormData();
			console.log($scope.uploadedImages);
			if ($scope.uploadedImages) {
				fs.append("file", $scope.uploadedImages);
			}
			// customer.uploadImages(fs)
			// 	.then(function(response) {
			// })
			var obj = JSON.parse($window.localStorage.user);

			$http.post("/api/v1/customer/gallery", fs, {
					//	transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined,
						'user_id': obj._id
					}
				})
				.success(function(response) {
					if (response) {
						callback(response);
						//return { response:$q.defer().resolve(response)};
					} else {
						$q.reject(response);
						callback({
							response: $q.defer().promise
						});
						//return { response:$q.defer().promise};
					}
				})
				.error(function(err) {
					alert('There was some error uploading your files. Please try Uploading them again.');
				});
		}
		$scope.userGallery = JSON.parse($window.localStorage.user)
		$scope.imgPath = $window.localStorage.imagePath;
		$scope.barberInfopage = function(id){
			$state.go('barberInfo',{
						_id: id
					});
		}

		if($state.current.name =='barberInfo'){
			var obj = {
				_id: $stateParams._id
			}
			customer.barberInfo(obj)
				.then(function(response) {
					$scope.profileInfo = response.data.user;
				})
		}
		$scope.goToNextpage = function(id){
			$state.go('appointmentDetail', {
				_id: id
			});
		}
	});