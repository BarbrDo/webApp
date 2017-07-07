angular.module('BarbrDoApp')
	.controller('barberCtrl', function($scope, $rootScope, $location, barber, $stateParams, $state, $window, toastr) {
		var objj = JSON.parse($window.localStorage.user);
		$scope.imgPath = $window.localStorage.imagePath;
		$scope.search = {};

		
		$scope.appointments = function() {
			$scope.loaderStart = true;
			barber.appointments()
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.pendingComplete = response.data.data;
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
		if ($state.current.name == 'appointmentDetail' || $state.current.name == 'appointmentDetailOfBarber' || $state.current.name == 'markComplete' || $state.current.name == 'rescheduleAppointment') {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
			}
			barber.appointment(obj).then(function(response) {
				$scope.loaderStart = false;
				$scope.particularAppointment = response.data.data;
				var price = 0;
				var sum = 0;
				var len = response.data.data.customer_id.ratings.length;
				for (var i = 0; i < len; i++) {
					sum += response.data.data.customer_id.ratings[i].score
				}
				$scope.ratingCus = sum / len

				if (response.data.data.services) {
					for (var i = 0; i < response.data.data.services.length; i++) {
						if (response.data.data.services[i].price) {
							price += response.data.data.services[i].price
						}
					}
				}
				$scope.totoalPrice = price;
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
			obj.search = $scope.search.searchChair;
			$scope.loaderStart = true;
			barber.shopsHavingChairs(obj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.shopChairs = response.data.data;
					console.log(response)
				});
		}
		if ($state.current.name == 'shopChairs') {
			var obj = {
				_id: $stateParams._id
			}
			barber.shopChairs(obj).then(function(response) {
				$rootScope.particularShop = response.data.data;
				console.log(response.data.data)
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
		$rootScope.selectDate = myArray;
		// $scope.selectedDated = 0;
		$scope.setSelected = function(prop,index) {
			$rootScope.selectedDate = prop.toISOString().slice(0, 10);
			$scope.selecteddd = index;
		};
		$scope.changeObject = function(chair) {
			$scope.chairId = chair._id;
			$rootScope.chair = chair;

		}
		$scope.requestChair = function() {
			if ($scope.chairId) {
				$scope.loaderStart = true;
				var passObj = {
					shop_id: $stateParams._id,
					chair_id: $scope.chairId,
					barber_id: objj._id,
					barber_name: objj.first_name,
					booking_date: $rootScope.selectedDate
				}

				barber.requestChair(passObj).then(function(response) {
					$scope.loaderStart = false;
					toastr.success('Your request for chair is successfully saved');
					$state.go('request-chair');
				}).catch(function(result) {
					$scope.loaderStart = false;
                                        console.log(result)
					toastr.error(result.data.msg);
				})
			} else {
				toastr.error('Please select date and chair');
			}

		}

		$scope.barbertasks = function(id,customer){
			$scope.id = id;
			$scope.customer = customer._id
			$rootScope.custname = customer ; 
		}


		$scope.confirmAppointment = function() {
			var params = {
				"appointment_id": $scope.id
			}
			barber.confirmAppointment(params).then(function(response) {
				toastr.success('Your have confirmed a request');
				$scope.appointments();
			})
		}

		$scope.completeAppointment = function() {
			var params = {
				"appointment_id": $scope.id,
				"customer_id": $scope.customer
			}
			barber.completeAppointment(params).then(function(response) {
				toastr.success('Your have completed a request');
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

                var myobj = {
                    minutes: time,
                    appointment_id: $stateParams._id,
                    appointment_date: $scope.appointmentData.appointment_date
                }
                
                barber.reschedule(myobj).then(function(response) {
                    toastr.success('Your appointment is successfully rescheduled');
                    $state.go('barberDashboard');
                }).catch(function(result) {
                    console.log(result)
                });
       
        };


		$scope.cancelAppointment = function() {
			var myobj = {
				appointment_id: $stateParams._id,
			}
			barber.cancelAppoint(myobj).then(function(response) {
				toastr.success('Your appointment is successfully canceled.');
			})
		}

		$scope.managerequests = function() {
			barber.manageRequest().then(function(response) {
				$rootScope.shoprequest = response.data.result ;
			})
		}

		$scope.rejectrequest = function(chair) {
			barber.declineRequest(chair).then(function(response) {
				toastr.success('Request is Declined successfully');
				$scope.managerequests();
			}).catch(function(result) {
				toastr.warning('Invalid request ! Chair split Required');
			})
		}


		$scope.acceptrequest = function(chair) {
			barber.acceptRequest(chair).then(function(response) {
				toastr.success('Request is Accepted successfully');
				$scope.managerequests();
			}).catch(function(result) {
				toastr.warning('Invalid request ! Chair split Required');
			})
		}


		$scope.shopdetails = function() {
			barber.RequesterDetail($stateParams.id).then(function(response) {
				$rootScope.shoprequesterpic = response.data.data[0];
				$rootScope.shoprequester = response.data.data[0].shopinfo[0];
			})
		}

		$scope.payNow = function() {
			toastr.warning('Work in progress.')
		}

		$scope.cancel = function(index) {
	      if ($scope.editing !== false) {
	        $scope.editing = false;
	      }
	    };


		if ($state.current.name == 'manageservices' || $state.current.name == 'addservice') {
			$scope.loaderStart = true;
			barber.allServices().then(function(response) {
				$scope.loaderStart = false;
				$scope.servicesData = response.data.data
			})
		}
		$scope.addservice = function(service,price) {
			if(price) {
				var obj={
				name : service.name,
				price: price
			}
			barber.addService(obj).then(function(response) {
			toastr.success("Service Added Successfully");
			$state.go('manageservices');
			}).catch(function(result){
				toastr.error("This service is already added!! You cant add it again");
			})
			}
			else {
				toastr.error("Please add price");

			}
			
		}

		$scope.editservices = function(service) {
			barber.editService(service).then(function(response) {
			toastr.success("Service Edited Successfully");
			})
		}

		$scope.deleteservice = function(service) {
			barber.deleteService(service).then(function(response) {
			// $state.go('manageservices');
			history.go();
			toastr.success("Service Deleted Successfully");
			
			})
		}

	});