angular.module('BarbrDoApp')
  .controller('HeaderCtrl', function($scope, $location, $window, $auth, $timeout, $state, $rootScope, $uibModal, toastr, shop, geolocation,$q) {
    $scope.user = {};
    $scope.messages = {};
    if ($state.current.name == 'pageNotFound') {
      //        console.log("header controller is working");
    }

    $scope.tabActive = 'login';
    $scope.activeTab = function(value) {
      $scope.tabActive = value;
    }

    $scope.turnPage = function(value) {
      $scope.obj = {
        value: value
      }
    }

    $scope.isActive = function(viewLocation) {
      return viewLocation === $location.path();
    };
    $scope.mainClass = function() {
      if ($auth.isAuthenticated()) {
        return "bg_grey";
      } else {
        return
      }
    }

    // console.log("user",$window.localStorage.user)
    if ($window.localStorage.user) {
      $rootScope.userInfo = JSON.parse($window.localStorage.user);
      $rootScope.imgPath = $window.localStorage.imagePath;
    }

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    $scope.checkState = function(state) {
      if ($state.current.name == state) {
        return true;
      } else {
        return false;
      }
    }

    $scope.usertype = function(type) {
      $scope.user.user_type = type;
      if ($scope.user.user_type == 'barber' || $scope.user.user_type == 'shop') {
        $scope.show = true;
      } else {
        $scope.show = false;
      }
    }

    setInterval(function() {
      //           Below code is used to get location of the user
      $scope.coords = geolocation.getLocation().then(function(data) {
        $window.localStorage.lat = data.coords.latitude;
        $window.localStorage.long = data.coords.longitude;
        console.log($window.localStorage.lat, $window.localStorage.long)
        return {
          lat: data.coords.latitude,
          long: data.coords.longitude
        };
      });
    }, 10000);
    if ($window.localStorage.lat && $window.localStorage.long) {
      $rootScope.latLong = {

//        setInterval(function () {
//        //           Below code is used to get location of the user
//        $scope.coords = geolocation.getLocation().then(function (data) {
//        $window.localStorage.lat = data.coords.latitude;
//                $window.localStorage.long = data.coords.longitude;
//                console.log($window.localStorage.lat, $window.localStorage.long)
//                return {
//                lat: data.coords.latitude,
//                        long: data.coords.longitude
//                };
//        });
//        }, 10000);

        'latitude': $window.localStorage.lat,
        'longitude': $window.localStorage.long
      }
    } else {
      $rootScope.latLong = {
        'latitude': latLong[0].latitude,
        'longitude': latLong[0].longitude
      }
    }

    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      delete $window.localStorage.lat;
      delete $window.localStorage.long;
      delete $window.localStorage.imagePath;
      $state.go('home');
    };
    $scope.check = function() {
           $scope.user = JSON.parse($window.localStorage.user);
        console.log("fbauthe", $scope.user)
    }

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          // $rootScope.user = response.data.user;
          console.log("authenticate", response.data.user)
          $window.localStorage.user = JSON.stringify(response.data.user);
          $scope.user = JSON.parse($window.localStorage.user);
          $scope.check();
          if (response.data.imagesPath) {
            $window.localStorage.imagePath = response.data.imagesPath;
          }
          if (response.data.err) {
            console.log(response.data)
            $state.go('upcomingComplete');
          } else {
            if(response.data.user)
            {
              console.log("heree") 
              $scope.tabActive = 'signup';
            }
            
          }
        })
        .catch(function(response) {
          if (response.error) {
            $scope.messages = {
              error: [{
                msg: response.error
              }]
            };
            $scope.mainClass = function() {
              if ($auth.isAuthenticated()) {
                return "bg_grey";
              } else {
                return
              }
            }

            // console.log("user",$window.localStorage.user)
            if ($window.localStorage.user) {
              $rootScope.userInfo = JSON.parse($window.localStorage.user);
              $rootScope.imgPath = $window.localStorage.imagePath;
            }

            $scope.isAuthenticated = function() {
              return $auth.isAuthenticated();
            };
          }
        });
    };
    if ($state.current.name == 'manageservices' || $state.current.name == 'addservice') {
      shop.barberServices().then(function(response) {
        $scope.barberservices = response.data.data.length
      });
      shop.allServices().then(function(response) {
        $scope.servicesData = response.data.data.length
      })

    }

    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          //                Below code is used to get location of the user
          $scope.coords = geolocation.getLocation().then(function(data) {
            $window.localStorage.lat = data.coords.latitude;
            $window.localStorage.long = data.coords.longitude;
            return {
              lat: data.coords.latitude,
              long: data.coords.longitude
            };
          });
          $auth.login($scope.user)
            .then(function(response) {
              $window.localStorage.user = JSON.stringify(response.data.user);
              toastr.success('Welcome' + '  ' + response.data.user.first_name + '  ' + response.data.user.last_name);
              $rootScope.currentUser = response.data.user;
              $window.localStorage.imagePath = response.data.imagesPath;
              if (response.data.user.user_type == 'customer') {
                $state.go('upcomingComplete');
              }
              if (response.data.user.user_type == 'barber') {
                $state.go('barberDashboard');
              }
              if (response.data.user.user_type == 'shop') {
                $state.go('barbershopdashboard')
              }
            })
            .catch(function(response) {
              if (response.status == 402) {
                $state.go('subScription', {
                  _id: response.data.user._id
                })
              }

              $scope.messages = {
                error: Array.isArray(response.data) ? response.data : [response.data]
              };
            });
        })
    }
    $scope.signup = function() {
       console.log("user",$scope.user);
      $auth.signup($scope.user)
        .then(function(response) {
            toastr.success("Please check your mail to activate your account.");
            console.log($scope.tabActive)
        })
        .catch(function(response) {
          console.log(response)
          $scope.messages = response.data.msg

        });
    };
    $scope.fbsignup = function(user) {
      shop.fbSignup(user)
        .then(function(response) {
          toastr.success("Please check your mail to activate your account.")
          $state.go('upcomingComplete')
        })
        .catch(function(response) {
          $scope.messagess = {
            error: Array.isArray(response.data) ? response.data : response.data
          };
        });
    };
    $scope.addChair = function() {
      $scope.loaderStart = true;
      var obj = JSON.parse($window.localStorage.user);
      var passObj = {
        _id: $window.localStorage.shop_id
      };
      shop.addChair(passObj).then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Chair successfully added.');
        $rootScope.$emit("MyEvent", response);
        $state.go('barbershopdashboard')
      })
    }

    $scope.modelOpenFunction = function() {
      $rootScope.modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'instanceController12',
        windowClass: 'transmitter_modal',
        scope: $scope,
        size: ' holder'
      });
    }
    $scope.forgotPassword = function() {
      $scope.loaderStart = true;
      shop.forgotPassword($scope.user)
        .then(function(response) {
          toastr.success(response.data.msg);
          $('#forgotpassword').modal('hide');
          $scope.loaderStart = false;
        })
        .catch(function(response) {
          toastr.error(response.data.msg);
          $('#forgotpassword').modal('hide');
          $scope.user.email = '';
          $scope.loaderStart = false;
        });
    };
    $scope.disMiss = function() {
      $rootScope.$emit("closeEvent");
    }

  })

.controller('instanceController12', ['$uibModalInstance', '$scope', '$rootScope', function($uibModalInstance, $scope, $rootScope) {
  $rootScope.$on("closeEvent", function(evt, data) {
    $scope.cancel();
  })
  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }
}])
