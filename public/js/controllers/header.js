angular.module('BarbrDoApp')
  .controller('HeaderCtrl', function($scope, $location, $window, $auth, $timeout, $state, $rootScope, $uibModal, toastr, shop, geolocation, $q) {
    $scope.user = {};
    $scope.messages = {};
    if ($state.current.name == 'pageNotFound') {
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
        return {
          lat: data.coords.latitude,
          long: data.coords.longitude
        };
      });
    }, 10000);
    if ($window.localStorage.lat && $window.localStorage.long) {
      $rootScope.latLong = {
        'latitude': $window.localStorage.lat,
        'longitude': $window.localStorage.long
      }
    } else {
      $rootScope.latLong = {
        'latitude': latLong[0].latitude,
        'longitude': latLong[1].longitude
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
 
    $scope.authenticate = function(provider) {
      $scope.loaderStart = true;
      $auth.authenticate(provider)
        .then(function(response) {
          // $rootScope.user = response.data.user;
          $scope.user = response.data.user;
          // $scope.check();
          if (response.data.imagesPath) {
            $window.localStorage.imagePath = response.data.imagesPath;
          }
          if (response.data.err) {
            $window.localStorage.user = JSON.stringify(response.data.user);
            if (response.data.user.user_type == 'customer') {
              $state.go('upcomingComplete');
            }
            if (response.data.user.user_type == 'barber') {
              $state.go('barberDashboard');
            }
            if (response.data.user.user_type == 'shop') {
              $state.go('barbershopdashboard')
            }
          } else {
            $scope.loaderStart = false;
            $scope.tabActive = 'signup';
            $('.tab-content a[href="#signup"]').tab('show')


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
          //Below code is used to get location of the user
          $scope.coords = geolocation.getLocation().then(function(data) {
            $window.localStorage.lat = data.coords.latitude;
            $window.localStorage.long = data.coords.longitude;
            return {
              lat: data.coords.latitude,
              long: data.coords.longitude
            };
          });

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

    }
    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          if (response.data.user.facebook) {
            $scope.user = {"email":response.data.user.email,"password":"112233123"};
            $scope.login()
          } else {
            toastr.success("Please check your mail to activate your account.");
          }

        })
        .catch(function(response) {
          $scope.messages = response.data.msg

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