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
}
]);