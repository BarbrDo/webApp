angular.module('BarbrDoApp')
	.controller('barberCtrl', function($scope, $rootScope, $location, barber, $stateParams, $state, $window, toastr, $filter) {
		var objj = JSON.parse($window.localStorage.user);
		$scope.imgPath = $window.localStorage.imagePath;
		$scope.search = {};
		$scope.userid = objj._id

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
			zoom: 15
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
				$scope.viewmap = true;
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
					if ($scope.shopChairs.length == 0) {
					}

				});
		}

		$scope.setSelected = function(prop, index) {

			$rootScope.selectedDate = prop.toISOString().slice(0, 10);
			$scope.selecteddd = index;
			$scope.shopchairdetail();
		};

		$scope.changeObject = function(chair) {
			$scope.chairId = chair._id;
			$rootScope.chair = chair;
			console.log(chair._id)

		}
		$scope.shopchairdetail = function() {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
			}
			var shp = [];

			barber.shopChairs(obj).then(function(response) {
				$scope.loaderStart = false;
				$rootScope.particularShop = response.data.data[0];
				var len = response.data.data[0].chairs.length;

				for (var i = 0; i < len; i++) {
					if (response.data.data[0].chairs[i].isActive == true && response.data.data[0].chairs[i].availability != 'closed') {
						var objj = response.data.data[0].chairs[i];
						shp.push(objj);
					}
				}
				$rootScope.chairs = shp;
				$scope.chairsinshop();

			})
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

		};

		$scope.chairsinshop = function() {
			if ($rootScope.selectedDate) {
				var len = $rootScope.chairs.length;
				var resultArray = [];
				for (var i = 0; i < len; i++) {
					if ($rootScope.chairs[i].booking_start) {
						var booking_start = new Date($rootScope.chairs[i].booking_start);
						var month = booking_start.getUTCMonth() + 1; //months from 1-12
						var day = booking_start.getUTCDate();
						var year = booking_start.getUTCFullYear();
						$scope.booking_start = year + "-" + '0' + month + "-" + day
						var booking_end = new Date($rootScope.chairs[i].booking_end);
						var month = booking_end.getUTCMonth() + 1; //months from 1-12
						var day = booking_end.getUTCDate();
						var year = booking_end.getUTCFullYear();
						$scope.booking_end = year + "-" + '0' + month + "-" + day

					}
					var request = {};
					let k = 0;
					if ($rootScope.chairs[i].availability == 'booked' && $rootScope.chairs[i].type == 'self') {
						 request = {
							_id: $rootScope.chairs[i]._id,
							chair_name: $rootScope.chairs[i].name,
							shop_percentage: $rootScope.chairs[i].shop_percentage,
							chair_availability: $rootScope.chairs[i].availability,
							barber_percentage: $rootScope.chairs[i].barber_percentage,
							chair_type: $rootScope.chairs[i].type,
							chair_amount: $rootScope.chairs[i].amount,
							barber_info: $rootScope.chairs[i].barberInfo,
							text: "Non-barber"
						}
					} else if ($rootScope.chairs[i].availability == 'booked' && $rootScope.chairs[i].type != 'self' && $rootScope.selectedDate >= $scope.booking_start && $rootScope.selectedDate <= $scope.booking_end) {
						 request = {
							_id: $rootScope.chairs[i]._id,
							chair_name: $rootScope.chairs[i].name,
							shop_percentage: $rootScope.chairs[i].shop_percentage,
							chair_availability: $rootScope.chairs[i].availability,
							barber_percentage: $rootScope.chairs[i].barber_percentage,
							chair_type: $rootScope.chairs[i].type,
							chair_amount: $rootScope.chairs[i].amount,
							barber_info: $rootScope.chairs[i].barberInfo,
							barber_id: $rootScope.chairs[i].barber_id,
							text: "Already Booked"
						}
					} else {

						if ($rootScope.chairs[i].barberRequest.length > 0) {
							var abc = false;
							for (var j = 0; j < $rootScope.chairs[i].barberRequest.length; j++) {
								var booking_date = new Date($rootScope.chairs[i].barberRequest[j].booking_date);
								var month = booking_date.getUTCMonth() + 1; //months from 1-12
								var day = booking_date.getUTCDate();
								var year = booking_date.getUTCFullYear();
								$scope.booking_date = year + "-" + '0' + month + "-" + day
								if ($rootScope.chairs[i].barberRequest[j].requested_by == 'barber') {
									// pending
									if ($scope.userid == $rootScope.chairs[i].barberRequest[j].barber_id && $rootScope.selectedDate == $scope.booking_date) {

										request = {
											_id: $rootScope.chairs[i]._id,
											chair_name: $rootScope.chairs[i].name,
											chair_availability: $rootScope.chairs[i].availability,
											shop_percentage: $rootScope.chairs[i].shop_percentage,
											barber_percentage: $rootScope.chairs[i].barber_percentage,
											chair_type: $rootScope.chairs[i].type,
											chair_amount: $rootScope.chairs[i].amount,
											barber_info: $rootScope.chairs[i].barberInfo,
											selecteddate: $rootScope.selectedDate,
											booking: $scope.booking_date,
											check: $scope.booking_date == $rootScope.selectedDate,
											text: "Pending"
										}
										abc = true;
										resultArray.push(request);
										++k;
										break;
										
									}
								}
								if ($rootScope.chairs[i].barberRequest[j].requested_by == 'shop') {
									//accept decline
									if ($scope.userid == $rootScope.chairs[i].barberRequest[j].barber_id && $rootScope.selectedDate == $scope.booking_date) {
										 request = {
											_id: $rootScope.chairs[i]._id,
											chair_name: $rootScope.chairs[i].name,
											chair_availability: $rootScope.chairs[i].availability,
											shop_percentage: $rootScope.chairs[i].shop_percentage,
											barber_percentage: $rootScope.chairs[i].barber_percentage,
											chair_type: $rootScope.chairs[i].type,
											chair_amount: $rootScope.chairs[i].amount,
											barber_info: $rootScope.chairs[i].barberInfo,
											text: "Accept Reject"
										}
										abc = true;
										resultArray.push(request);
										++k;
										break;
									}

								}

								if (abc == false) {
									request = {
										_id: $rootScope.chairs[i]._id,
										chair_name: $rootScope.chairs[i].name,
										chair_availability: $rootScope.chairs[i].availability,
										shop_percentage: $rootScope.chairs[i].shop_percentage,
										barber_percentage: $rootScope.chairs[i].barber_percentage,
										chair_type: $rootScope.chairs[i].type,
										chair_amount: $rootScope.chairs[i].amount,
										barber_info: $rootScope.chairs[i].barberInfo,
										text: "Request"
									}
								}
							}
						} else {
							request = {
								_id: $rootScope.chairs[i]._id,
								chair_name: $rootScope.chairs[i].name,
								chair_availability: $rootScope.chairs[i].availability,
								shop_percentage: $rootScope.chairs[i].shop_percentage,
								barber_percentage: $rootScope.chairs[i].barber_percentage,
								chair_type: $rootScope.chairs[i].type,
								chair_amount: $rootScope.chairs[i].amount,
								barber_info: $rootScope.chairs[i].barberInfo,
								text: "Request"
							}
						}
					}
					if (k == 0) {
						resultArray.push(request);
					}

				}
				$rootScope.chairsLoop = resultArray;
			}

		};



		$scope.requestChair = function(shopid, userType) {
			if ($scope.chairId) {
				$scope.loaderStart = true;
				var passObj = {
					shop_id: shopid,
					chair_id: $scope.chairId,
					barber_id: objj._id,
					barber_name: objj.first_name + ' ' + objj.last_name,
					booking_date: $rootScope.selectedDate,
					chair_type: $rootScope.chair.type,
					user_type: userType
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

		$scope.barbertasks = function(id, customer) {
			$scope.id = id;
			$scope.customer = customer._id
			$rootScope.custname = customer;
		}


		$scope.confirmAppointment = function() {
			$scope.loaderStart = true;
			var params = {
				"appointment_id": $scope.id
			}
			barber.confirmAppointment(params).then(function(response) {
				$scope.loaderStart = false;
				toastr.success('Your have confirmed a request');
				$scope.appointments();
			})
		}

		$scope.completeAppointment = function() {
			$scope.loaderStart = true;
			var params = {
				"appointment_id": $scope.id,
				"customer_id": $scope.customer
			}
			barber.completeAppointment(params).then(function(response) {
				$scope.loaderStart = false;
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

		$scope.rescheduleappoint = function(time) {
			if (time) {
				$scope.time = time
			} else {
				toastr.error('Please select time to Reschedule');
			}
		}


		$scope.timeReschedule = function() {
			$scope.loaderStart = true;
			var myobj = {
				minutes: $scope.time,
				appointment_id: $stateParams._id,
				appointment_date: $scope.appointmentData.appointment_date
			}
			barber.reschedule(myobj).then(function(response) {
				$scope.loaderStart = false;
				toastr.success('Your appointment is successfully rescheduled');
				$state.go('barberDashboard');
			}).catch(function(result) {
				$scope.loaderStart = false;
				toastr.error('Error');
			});
		};


		$scope.cancelAppointment = function() {
			$scope.loaderStart = true;
			var myobj = {
				appointment_id: $stateParams._id,
			}
			barber.cancelAppoint(myobj).then(function(response) {
				$scope.loaderStart = false;
				toastr.success('Your appointment is successfully canceled.');
			})
		}

		$scope.managerequests = function() {
			$scope.loaderStart = true;
			barber.manageRequest().then(function(response) {
				$scope.loaderStart = false;
				$rootScope.shoprequest = response.data.result;
			})
		}

		$scope.barberservice = function(service) {
			$scope.service = service;
		}

		$scope.rejectrequest = function(chair) {
			$scope.loaderStart = true;
			barber.declineRequest(chair).then(function(response) {
				$scope.loaderStart = false;
				toastr.success('Request is Declined successfully');
				$scope.managerequests();
			}).catch(function(result) {
				$scope.loaderStart = false;
				toastr.warning('Invalid request ! Chair split Required');
			})
		}


		$scope.acceptrequest = function(chair) {
			$scope.loaderStart = true;
			barber.acceptRequest(chair).then(function(response) {
				$scope.loaderStart = false;
				toastr.success('Request is Accepted successfully');
				$scope.managerequests();
			}).catch(function(result) {
				$scope.loaderStart = false;
				toastr.warning('Invalid request ! Chair split Required');
			})
		}


		$scope.shopdetails = function() {
			$scope.loaderStart = true;
			barber.RequesterDetail($stateParams.id).then(function(response) {
				$scope.loaderStart = false;
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
			barber.barberServices().then(function(response) {
				$scope.loaderStart = false;
				$scope.barberservices = response.data.data
			});
			barber.allServices().then(function(response) {
				$scope.loaderStart = false;
				$scope.servicesData = response.data.data
			})
		}

		$scope.addservice = function(service, price) {
			if (price) {
				$scope.loaderStart = true;
				var obj = {
					service_id: service._id,
					name: service.name,
					price: price
				}
				barber.addService(obj).then(function(response) {
					$scope.loaderStart = false;
					toastr.success("Service Added Successfully");
					$state.go('manageservices');
				}).catch(function(result) {
					$scope.loaderStart = false;
					toastr.error("This service is already added!! You cant add it again");
				})
			} else {
				toastr.error("Please add price");

			}

		}

		$scope.editservices = function(service_id, price, name) {
			$scope.loaderStart = true;
			var obj = {
				service_id: service_id,
				price: price,
				name: name
			}
			barber.editService(obj).then(function(response) {
				$scope.loaderStart = false;
				toastr.success("Service Edited Successfully");
			})
		}

		$scope.deleteservice = function() {
			$scope.loaderStart = true;
			barber.deleteService($scope.service).then(function(response) {
				barber.barberServices().then(function(res) {
					$scope.loaderStart = false;
					$scope.barberservices = res.data.data
				});
				barber.allServices().then(function(response) {
					$scope.loaderStart = false;
					$scope.servicesData = response.data.data
				})
				toastr.success("Service Deleted Successfully");

			})
		};



		$scope.Showmaps = function() {
			//If DIV is hidden it will be visible and vice versa.
			$scope.viewmap = $scope.viewmap ? false : true;
		}

		$scope.finacialcenter = function() {
			$scope.loaderStart = true;
			var myArray = [];
			var date = new Date();
			var ddate = new Date();
			ddate.setDate(date.getDate() - 6);
			$scope.startdate = $filter('date')(ddate, "yyyy-MM-dd");
			$scope.enddate = $filter('date')(date, "yyyy-MM-dd");
			var obj = {
				startdate: $scope.startdate,
				enddate: $scope.enddate
			}
			barber.finacialCenter(obj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.sale = response.data.data;
				})

		}

		var max = new Date();
		max.setDate(max.getDate() - 1);
		$scope.maxDate = max;
		var min = new Date();
		$scope.minDate = min;

		$scope.open1 = function() {
			$scope.popup1.opened = true;
		};
		$scope.open2 = function() {
			$scope.popup2.opened = true;
		};


		$scope.formats = ['yyyy-MM-dd'];
		$scope.format = $scope.formats[0];

		$scope.popup1 = {
			opened: false
		};
		$scope.popup2 = {
			opened: false
		};

	});