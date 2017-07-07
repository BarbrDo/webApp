 angular.module('BarbrDoApp')
	.controller('shopCtrl', function($scope, $rootScope, $location, shop, $http , $stateParams,$window,$state,toastr) {
		// var obj = JSON.parse($window.localStorage.user);
		$scope.myobj = {};
		
		$scope.shopData = JSON.parse($window.localStorage.user);

		$scope.chairrequest = function() {
			$scope.loaderStart = true;
			shop.chairRequest($window.localStorage.shop_id)
			.then(function(response) {
				$scope.loaderStart = false;
				$rootScope.requests = response.data.result;
				console.log(response.data.result)
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Error');
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
		      }).catch (function(result) {
                            console.log(result)
                           toastr.error('Error');
                        })
		}

		$scope.requesterdetails = function() {
			$scope.loaderStart = true;
				shop.barberDetail($stateParams.id)
					.then(function(response) {
						console.log(response)
						$scope.loaderStart = false;
						$rootScope.requester = response.data.data[0];
					}).catch (function(result) {
                            console.log(result)
                           toastr.error('Errorregh3');
                        })

		};

		$scope.nobarbers = function() {
			toastr.info('No Barber in the Chair');
		}


		$scope.requestbarber = function(barber) {
				shop.requestBarber($window.localStorage.shop_id,$stateParams.id,barber)
					.then(function(response) {
						toastr.success('Request is Sended to the barber successfully ! Check Your Mail');
						$state.go('chairaction', { id: $stateParams.id,name: $stateParams.name});					
					}).catch(function(result) {
						toastr.error('Sorry!! This Chair is not available');

					})

		};

		$scope.rejectrequest = function(chair) {
			shop.declineRequest(chair).then(function(response) {
				toastr.success('Request is Declined successfully');
				$scope.chairrequest();
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Error');
                        })
		}

		if($state.current.name == 'barbershopdashboard'){
			var obj = {
				obj:JSON.parse($window.localStorage.user)
			}
			shop.shopInfo(obj).then(function(response){
				$scope.chairs = response.data.user;
				$window.localStorage.shop_id = response.data.user.shop[0]._id;
			})
		}

		$scope.uploadImage = function(img) {
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
					var obj = {
						obj:JSON.parse($window.localStorage.user)
					}
					shop.shopInfo(obj).then(function(res) {
						toastr.success('Image uploaded in gallery succesfully');
						$scope.userGallery = res.data.user;
					})


				})
				.error(function(err) {
					toastr.error('There was some error uploading your files. Please try Uploading them again.');
				});
		}

		$scope.showgallery = function() {
			var obj = {
				obj:JSON.parse($window.localStorage.user)
			}
			shop.shopInfo(obj).then(function(res) {
				$scope.userGallery = res.data.user;
				$scope.ratings = res.data.user.ratings;
			}).catch (function(result) {
                            console.log(result)
                        })
		}

		$scope.viewimg = function(pic) {
			$rootScope.pic = pic;
		}

		$scope.delpic = function(pic) {
			shop.deleteImage(pic)
				.then(function(response) {
					var obj = {
						obj:JSON.parse($window.localStorage.user)
					}
					shop.shopInfo(obj).then(function(res) {
						toastr.success('Image deleted succesfully');
						$scope.userGallery = res.data.user;
					})
				}).catch(function(result) {
					toastr.error('Error in deleting Image');
				})
		}


		$scope.acceptrequest = function(chair) {
			shop.acceptRequest(chair).then(function(response) {
				toastr.success('Request is Accepted successfully');
				$scope.chairrequest();
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Error');
                        })
		}

		$scope.shopDashboard = function(){
			console.log("here")
            $scope.loaderStart = true;
			var obj = {
				obj:JSON.parse($window.localStorage.user)
			}
			shop.shopInfo(obj).then(function(response){
				$scope.loaderStart = false;
				$scope.chairs = response.data.user;
				$window.localStorage.shop_id = response.data.user.shop[0]._id;
				$rootScope.shopinfo = response.data.user.shop[0];
				
			})
		}
                
                $scope.chairdetails = function()
		{
			shop.chairDetail($stateParams.id)
			.then(function(response) {
				$rootScope.chairs = response.data.data[0].chairs[0];
                        $rootScope.chair_split = response.data.data[0].chairs[0].shop_percentage;
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Error');
                        })
		}
                
		if($state.current.name == 'chairaction'){
                    $scope.loaderStart = true;
                    $scope.chairName = $stateParams.name
                    $scope.chairId = $stateParams.id
            setTimeout(function() {
                shop.chairDetail($stateParams.id)
				.then(function(response) {
                    $scope.loaderStart = false;
                   if(response.data.data[0].chairs[0].type=='percentage')
                   { 
                       $scope.slider = {                                
								value: response.data.data[0].chairs[0].shop_percentage,
								options: {
									showSelectionBar: true,
									floor: 0,
									ceil: 100,
									step: 5,
									ticksArray: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
					                }
                            };
                   }
                   else
                   {
                       $scope.slider = {                                 
							value: 0,
							options: {
								showSelectionBar: true,
								floor: 0,
								ceil: 100,
								step: 5,
								ticksArray: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
				                    }
                            };
                   }                            
				});
            }, 500);
		}

		if($state.current.name == 'chairwithbarber'){
			$scope.chairName = $stateParams.name
			$scope.chairId = $stateParams.id
			
		};

		

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
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Amount is required');
                        })
		}
                
                
		$scope.saveWeeklyFair = function(type){
			var obj = {
				type: type,
				amount : $scope.myobj.priceValue,
				chair_id:$stateParams.id
			}
			shop.saveWeeklyFair(obj).then(function(response){
				toastr.success(obj.type + '  ' + ' fair successfully saved.');
				$state.go('barbershopdashboard')
			}).catch (function(result) {
                           toastr.error('Amount is required');
                        }) 
        
        }

		$scope.postToAllBarbers = function(){
			var obj = {
				chair_id:$stateParams.id
			}
			shop.postToAllBarbers(obj).then(function(response){
				toastr.success('Chair successfully posted to all barbers.');
				$state.go('barbershopdashboard')
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Chair Type is Required');
                        })
		}
		$scope.markBooked = function(){
			var obj = {
				chair_id:$stateParams.id
			}
			shop.markBooked(obj).then(function(response){
				toastr.success('Chair successfully Booked to non-barberdo barber.');
				$state.go('barbershopdashboard')
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Error');
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
			}).catch (function(result) {
                            console.log(result)
                           toastr.error('Error in deleting');
                        })
		}
	});