angular.module('BarbrDoApp')
  .controller('HeaderCtrl', function($scope, $location, $window, $auth, $state,$rootScope,$uibModal,toastr,shop) {
    $scope.user = {};
    $scope.messages = {};
    $scope.isActive = function(viewLocation) {
      return viewLocation === $location.path();
    };

    $scope.mainClass = function(){
      if ($auth.isAuthenticated()) {
        return "bg_grey";
      }
      else{
        return
      }
    }
    if($window.localStorage.user){
      $scope.userInfo = JSON.parse($window.localStorage.user);
      $scope.imgPath = $window.localStorage.imagePath;
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

    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $state.go('home');
    };
    $scope.authenticate = function(provider) {
      console.log(provider)
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          if(response.data.imagesPath){
            $window.localStorage.imagePath = response.data.imagesPath;
          }
          if(response.data.err)
          {

            $state.go('upcomingComplete');
          }
          else
          {
          $state.go('facebookSignup'); 
          } 
        })
        .catch(function(response) {
          console.log(response)
          if (response.error) {
            $scope.messages = {
              error: [{ msg: response.error }]
            };
          } else if (response.data) {
            $scope.messages = {
              error: [response.data]
            };
          }
        });
    };

    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          toastr.success('Welcome');
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $window.localStorage.imagePath = response.data.imagesPath;
          if(response.data.user.user_type =='customer'){  
            $state.go('upcomingComplete');    
          }
          if(response.data.user.user_type =='barber'){
            $state.go('barberDashboard'); 
          }
          if(response.data.user.user_type =='shop'){
            $state.go('barbershopdashboard')
          }   
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          }; 
        });
    };

    $scope.changeTab = function(tab){
      console.log('tab',tab);
      $scope.active.val = tab;
    }
    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          toastr.success("Please check your mail to activate your account.")   
        })
        .catch(function(response) {
          $scope.messagess = {
            error: Array.isArray(response.data) ? response.data : response.data
          };
        });
    };

    $scope.fbsignup = function(user) {
      console.log("here")
      shop.fbSignup(user)
        .then(function(response) {
          toastr.success("Please check your mail to activate your account.")
          $state.go('upcomingComplete') 
          console.log("response",response)  
        })
        .catch(function(response) {
          $scope.messagess = {
            error: Array.isArray(response.data) ? response.data : response.data
          };
        });
    };

    $scope.addChair = function(){
       var obj = JSON.parse($window.localStorage.user);
       var passObj = {_id:$window.localStorage.shop_id};
        shop.addChair(passObj).then(function(response){
          toastr.success('Chair successfully added.');
          $rootScope.$emit("MyEvent",response);
        })
    }

    $scope.modelOpenFunction = function(){
      $rootScope.modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'instanceController12',
        windowClass: 'transmitter_modal',
        scope: $scope,
        size: ' holder'     
      });
    }
  })

   .controller('instanceController12', ['$uibModalInstance', '$scope',
 function($uibModalInstance, $scope) {

   $scope.cancel = function() {
    //console.log("m heerrerrerer")
    $uibModalInstance.dismiss('cancel');

  }

 }])