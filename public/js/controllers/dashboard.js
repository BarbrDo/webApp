angular.module('BarbrDoApp')
	.controller('dashboardCtrl', function($scope, $rootScope, $filter, $location, customer, $stateParams, $state, $window, ngTableParams, $timeout, $http, toastr) {
		$scope.dollarAmmount = 0.00;
		$scope.annualCost = $scope.dollarAmmount;
		$scope.search = {};
		var obj = {
			'latitude': "30.538994",
			'longitude': "75.955033"
		}
                console.log(latLong);
		$scope.callFunctions = function() {
			$scope.shoplist();
			$scope.barberList();
		}
		$scope.shoplist = function() {
			obj.search = $scope.search.searchShop;
			$scope.loaderStart = true;
			customer.shopList(obj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.shops = response.data.data;
				});
		}
		$scope.dateSelectClass = function(index) {
			if ($scope.selectedDate) {
				return {
					active: index > $scope.selectDate.length / 2 - 1
				}
			}
		}
		$scope.allShopsHavingBarbers = function(id) {
			$state.go('shopContainsBarbers', {
				_id: id
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

			customer.barberAll(obj)
				.then(function(response) {
					console.log("all", response.data.data[0])
					$scope.loaderStart = false;
					$scope.barberdet = response.data.data[0];

				});

			var passObj = {
				"shop_id": $stateParams.shop_id,
				"barber_id": $stateParams.barber_id,
				"latitude": "30.708225",
				'longitude': "76.7029445"
			}

			customer.bookNowPageInfo(passObj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.barberInformation = response.data.data;
					console.log(response)
					var sum = 0;
					var len = response.data.data[0].rating.length;
					for (var i = 0; i < len; i++) {
						sum += response.data.data[0].rating[i].score
					}
					$scope.ratingavg = sum / len;
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

		}
		$scope.selecteddd = 0;
		$scope.setSelected = function(prop, index) {
			$scope.selectedDate = prop.toISOString().slice(0, 10);
			$scope.selecteddd = index;
			$scope.formattedDate = $filter('date')($scope.selectedDate, "yyyy-MM-dd");
			var obj = {
				barberid: $stateParams.barber_id,
				date: $scope.formattedDate
			}
			customer.timeavailability(obj)
				.then(function(response) {
					$scope.timeSlots = response.data.data;
					console.log(response.data.data)
				})

		};

		$scope.nextdates =function(){
			var myArray = [];
			// Below code is generating current date + 6 days more
			var date = new Date($scope.selectDate[6]);
			myArray.push(date)
			for (var i = 1; i <= 6; i++) {
				var date = new Date($scope.selectDate[6]);
				date.setDate(date.getDate() + i);
				myArray.push(date)
			}
			console.log(myArray)
			$scope.selectDate = myArray;
		}

		$scope.previousdates = function(){
			// Below code is generating current date + 6 days more
			// var date = new Date($scope.selectDate[0]);
			// date.setDate(date.getDate() - 6)
			// myArray.push(date)
			// for (var i = 1; i <= 6; i++) {
			// 	var date = new Date($scope.selectDate[0]);
			// 	date.setDate(date.getDate() + i);
			// 	myArray.push(date)
			// }
			// console.log(myArray)
			// $scope.selectDate = myArray;	
		}

		$scope.selectedTime = 0;
		$scope.setSelectedTime = function(prop, index) {
			$scope.choosedTime = prop;
			$scope.selectedTime = index
		};
		$scope.barberList = function() {
			obj.search = $scope.search.searchBarber;
			$scope.loaderStart = true;
			customer.barberAll(obj)
				.then(function(response) {
					console.log("all barbers", response)
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
			$scope.annualCost = $scope.dollarAmmount;
		};

		$scope.payLater = function(chair_amount, chair_id, chair_type, chair_name, chair_shop_percentage, chair_barber_percentage) {
			var myarr = [];
			console.log("this is date",$scope.selected.length)
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
				}).catch(function(err) {
					console.log(err)
					toastr.error('Something went wrong!Please try again later.');
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
			zoom: 15
		}
		if ($state.current.name == 'pending') {
			$scope.loaderStart = true;
			var passingObj = {
				_id: $stateParams._id
			}
			customer.pendingConfirmation(passingObj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.pendingData = response.data.data;
					$scope.time = response.data.data.appointment_date.substring(11, 19);
					var sum = 0;
					var len = response.data.data.barber_id.ratings.length;
					for (var i = 0; i < len; i++) {
						sum += response.data.data.barber_id.ratings[i].score
					}
					$scope.ratingBarber = sum / len
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

		$scope.appointmentdet = function() {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams.id
			}
			$scope.markers = [];
			$scope.map = {
				center: {
					latitude: 30.708225,
					longitude: 76.7029445
				},
				zoom: 15
			}
			customer.appointmentDetail(obj)
				.then(function(response) {
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
					$scope.loaderStart = false;
					$scope.viewmap = true;
					$scope.appointmentdetail = response.data.data;
					var sum = 0;
					var price = 0;
					var len = response.data.data.barber_id.ratings.length;
					for (var i = 0; i < len; i++) {
						sum += response.data.data.barber_id.ratings[i].score
					}
					if (response.data.data.services) {
						for (var i = 0; i < response.data.data.services.length; i++) {
							if (response.data.data.services[i].price) {
								price += response.data.data.services[i].price
							}
						}
					}
					$scope.totoalPrice = price;
					$scope.ratingavg = sum / len;
				})
		}

		$scope.Showmaps = function() {
			//If DIV is hidden it will be visible and vice versa.
			$scope.viewmap = $scope.viewmap ? false : true;
		}

		$scope.rescheduleappoint = function(time, appoint) {
			if (time) {
				$scope.time = time
				$scope.appoint = appoint
			} else {
				toastr.error('Please select time to Reschedule');
			}
		}


		$scope.timeReschedule = function() {
			$scope.loaderStart = true;
			var myobj = {
				minutes: $scope.time,
				appointment_id: $stateParams.id,
				appointment_date: $scope.appointmentdetail.appointment_date,
				barber_id: $scope.appoint.barber_id._id,
				name: $scope.appoint.barber_name,
				email: $scope.appoint.barber_id.email
			}
			customer.contactBarber(myobj).then(function(response) {
				$scope.loaderStart = false;
				$state.go('upcomingComplete');
				toastr.success(response.data.msg);

			}).catch(function(result) {
				toastr.error(result.data.msg);
			});
		};


		$scope.uploadImage = function(img) {
			$scope.loaderStart = true;
			var fs = new FormData();
			if (img) {
				fs.append("file", img);
			}

			var obj = JSON.parse($window.localStorage.user);

			$http.post("/api/v1/customer/gallery", fs, {
					//	transformRequest: angular.identity,
					headers: {
						'Content-Type': undefined,
						'user_id': obj._id
					}
				})
				.success(function(response) {
					customer.getImages().then(function(res) {
						$scope.loaderStart = false;
						toastr.success('Image uploaded in gallery succesfully');
						$scope.userGallery = res.data.user;
					})
				})
				.error(function(err) {
					$scope.loaderStart = false;
					toastr.error('There was some error uploading your files. Please try Uploading them again.');
				});
		}

		// $scope.userGallery = JSON.parse($window.localStorage.user)
		$scope.imgPath = $window.localStorage.imagePath;

		$scope.showgallery = function() {
			$scope.loaderStart = true;
			customer.getImages().then(function(res) {
				$scope.loaderStart = false;
				$scope.userGallery = res.data.user;
				$scope.ratings = res.data.user.ratings;
			})
		}

		$scope.viewimg = function(pic) {
			$rootScope.pic = pic;
		}

		$scope.delpic = function(pic) {
			$scope.loaderStart = true;
			customer.deleteImage(pic)
				.then(function(response) {
					customer.getImages().then(function(res) {
						$scope.loaderStart = false;
						toastr.success('Image deleted succesfully');
						$scope.userGallery = res.data.user;
					})
				}).catch(function(result) {
					toastr.error('Error in deleting Image');
				})
		}

		$scope.barberInfopage = function(id) {
			$state.go('barberInfo', {
				_id: id
			});
		}


		if ($state.current.name == 'barberInfo') {
			$scope.loaderStart = true;
			var obj = {
				_id: $stateParams._id
			}
			customer.barberInfo(obj)
				.then(function(response) {
					$scope.loaderStart = false;
					$scope.profileInfo = response.data.user;
					var sum = 0;
					var len = response.data.user.ratings.length;
					for (var i = 0; i < len; i++) {
						sum += response.data.user.ratings[i].score
					}
					$scope.ratingavg = sum / len;
				})
		}
		$scope.goToNextpage = function(id) {
			$state.go('appointmentDetail', {
				_id: id
			});
		}

		// Stripe Implementation
		$scope.stripeCall = function() {
			var stripe = Stripe('pk_test_fswpUdU8DBIKbLz1U637jNF7');
			var elements = stripe.elements();
			var card = elements.create('card', {
				style: {
					base: {
						iconColor: '#666EE8',
						color: '#31325F',
						lineHeight: '40px',
						fontWeight: 300,
						fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
						fontSize: '15px',
						'::placeholder': {
							color: '#CFD7E0',
						},
					},
				}
			});
			card.mount('#card-element');

			function setOutcome(result) {
				var successElement = document.querySelector('.success');
				var errorElement = document.querySelector('.error');
				successElement.classList.remove('visible');
				errorElement.classList.remove('visible');

				if (result.token) {
					// Use the token to create a charge or a customer
					// https://stripe.com/docs/charges
					successElement.querySelector('.token').textContent = result.token.id;
					successElement.classList.add('visible');

					var myarr = [];
					for (var i = 0; i < $scope.selected.length; i++) {
						var cusObj = {};
						cusObj.name = $scope.selected[i].name;
						cusObj.price = $scope.selected[i].price;
						myarr.push(cusObj);
					}
					var obj = {
						"shop_id": $stateParams.shop_id,
						"barber_id": $stateParams.barber_id,
						"services": myarr,
						"appointment_date": $scope.selectedDate + " " + $scope.choosedTime,
						"payment_method": "cash",
						"token": result.token.id,
						"amount": $scope.annualCost
					}


					customer.chargeCustomer(obj)
						.then(function(response) {
							$state.go('pending', {
								_id: response.data.data._id
							});
						}).catch(function(err) {
							toastr.error('Something went wrong!Please try again later.');
						});

				} else if (result.error) {
					errorElement.textContent = result.error.message;
					errorElement.classList.add('visible');
				}
			}

			card.on('change', function(event) {
				setOutcome(event);
			});

			document.querySelector('form').addEventListener('submit', function(e) {
				e.preventDefault();
				var form = document.querySelector('form');
				var extraDetails = {
					name: form.querySelector('input[name=cardholder-name]').value,
				};
				stripe.createToken(card, extraDetails).then(setOutcome);
			});
		}

	});