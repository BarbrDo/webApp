app_admin.controller("paymentCtrl", paymentCtrl);

function paymentCtrl($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $uibModal, $timeout) {
	  $scope.user = {};
  $scope.myobj = {};
  $scope.myobj.currentPage = 1;
  $scope.bigTotalItems = 175;
  $scope.bigCurrentPage = 1;

  var vm = this;
	vm.allPayments = allPayments;
	// all function definition
	function allPayments() {
    var passingObj = {
      page: $scope.myobj.currentPage,
      count: 10
    }
    if ($scope.myobj.search) {
      passingObj.search = $scope.myobj.search
    }
		Admin.allPayments(passingObj).then(function(responce) {
			vm.payments = responce.data;
			$scope.myobj.totalItems = responce.data.count;
			vm.loaderStart = false;
		}).catch(function(err) {
			toastr.error(err);
		})
	}

	$scope.Sort = function(val) {
    console.log("here in sorting")
    if ($scope.sort == val) {
      $scope.reverse = !$scope.reverse;
      //return;
    }
    $scope.sort = val;
     $('th i').each(function(){
            // icon reset
            $(this).removeClass().addClass('icon-sort');
        });

    if ($scope.reverse) {
      $('th .' + val + ' i').removeClass().addClass('icon-chevron-up');
    } else {
      $('th .' + val + ' i').removeClass().addClass('icon-chevron-down');
    }
  };
}