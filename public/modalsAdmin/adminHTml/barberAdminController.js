app_admin.controller("BarberAdminCtrl", BarberAdminCtrl);

function BarberAdminCtrl('$scope','$rootScope','$location','Admin','$filter','$log','$stateParams','$state','toastr','$localStorage'){
  if($localStorage.loggedIn){
    $rootScope.LoginUser = true;
  }
  else{
    $rootScope.LoginUser = false;
  }
  var vm = this;
  vm.pageChanged = pageChanged;
  vm.barbrInfo = barbrInfo;

  function pageChanged() {
      console.log("page changed"); 
      $scope.loaderStart = true;
      var passingObj = {
        page: $scope.myobj.currentPage,
        count: 30
      }
      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }
      Admin.barbers(passingObj).then(function(response) {
        $scope.loaderStart = false;
        $scope.myobj.totalItems = response.data.count / 3;
        $rootScope.barbers = response.data.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  }

  function  barbrInfo(barber_id) {
     console.log("barber info");
      Admin.barberServices().then(function(response){
        $scope.allservices = response.data.data;
         console.log("barber all services",$scope.allservices)
      })
      $rootScope.barber_id = barber_id;
      Admin.barberDetail(barber_id).then(function(response) {
        // $scope.loaderStart = false;
        $scope.barberInfo = response.data.data[0];
        console.log("barberInfo",$scope.barberInfo)
      })
  }
}