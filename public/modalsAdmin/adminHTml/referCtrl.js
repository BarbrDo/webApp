app_admin.controller("referCtrl", [
  '$scope',
  '$rootScope',
  '$location',
  'Admin',
  '$filter',
  '$log',
  '$stateParams',
  '$state',
  'toastr',
  '$localStorage',
  function($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $localStorage, $uibModal) {
    $scope.myobj.currentPage = 1;
    $scope.referObj = {
      currentPage :1
      } ;
    $scope.pageChanged = function() {
      $scope.loaderStart = true;
      var passingObj = {
        page: $scope.myobj.currentPage,
        count: 30
      }
      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }
      Admin.getReferUsers(passingObj).then(function(response) {
        $scope.loaderStart = false;
        $scope.myobj.totalItems = response.data.count ;
        console.log("response is",response.data.data)
        $rootScope.barbers = response.data.data;
      }).catch(function(result) {
        console.log("result",result);
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }
    $scope.particularUserData = function(){
      let obj = {
        _id:$stateParams._id
      }
      console.log(obj)
      Admin.getUserData(obj).then(function(response){
        console.log(response);
        $scope.referInfo = response.data.data;
      })
    }
    $scope.shop_invites = function(){
      $scope.loaderStart = true;
      var passingObj = {
        page: $scope.referObj.currentPage,
        count: 10
      }
      if ($scope.referObj.search) {
        passingObj.search = $scope.referObj.search
      }

      Admin.getShopInvites(passingObj).then(function(response) {
        $scope.loaderStart = false;
        console.log(response.data.data);
        console.log(response.data.count);
        $scope.referObj.totalItems = response.data.count ;
        $scope.shops = response.data.data;
      }).catch(function(result) {
        console.log("result",result);
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }
    if($state.current.name=='add_invited_shop'){
      console.log("add_invited_shop");
      let passData = {
        _id:$stateParams._id
      }
      Admin.getInviteShopProfile(passData).then(function(response){
        console.log(response);
        $scope.user = response.data.data[0];
      })
    }
    $scope.addcustomer = function(params) {
      $scope.loaderStart = true;
      console.log($scope.user)
      Admin.addCustomer($scope.user).then(function(response) {
          let passData = {
          _id:$stateParams._id
        }
        Admin.updateInviteShopProfile(passData).then(function(response){
          console.log(response);
           $scope.loaderStart = false;
          $state.go('shop_invites');
          $scope.shop_invites();
        })
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    };
    $scope.reject = function(id){
      let passData = {
          _id:id
        }
        Admin.deleteInviteShopProfile(passData).then(function(response){
          console.log(response);
           $scope.loaderStart = false;
          $state.go('shop_invites');
          $scope.shop_invites();
        })
    }
    $scope.allPlans = function(){
      Admin.featuringPlans().then(function(response){
        $scope.myplans = response.data.data
      })
    }
    $scope.addPlan = function(){
      $state.go('add_plans');
    }
}
]);