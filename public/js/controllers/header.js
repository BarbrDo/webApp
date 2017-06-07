angular.module('BarbrDoApp')
  .controller('HeaderCtrl', function($scope, $location, $window, $auth, $state,$rootScope,$uibModal,toastr) {
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
      $auth.authenticate(provider)
        .then(function(response) {
          toastr.success('Welcome');
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          if(response.data.imagesPath){
            $window.localStorage.imagePath = response.data.imagesPath;
          }
          $state.go('upcomingComplete');    
        })
        .catch(function(response) {
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
      // $('#bs-example-modal-lg').modal('hide');
      // console.log("login is working");
      // setTimeout(function(){
            // },1000)
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
          $auth.setToken(response);
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $window.localStorage.imagePath = response.data.imagesPath;
          if(response.data.user.user_type =='customer'){  
            $state.go('upcomingComplete');    
          }
          if(response.data.user.user_type =='barber'){
            $state.go('barberDashboard'); 
          }    
        })
        .catch(function(response) {
          $scope.messagess = {
            error: Array.isArray(response.data) ? response.data : response.data
          };
        });
    };

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