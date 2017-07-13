app_admin.controller("paymentCtrl", paymentCtrl);

function paymentCtrl($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $uibModal, $timeout) {
	var vm = this;
	vm.allPayments = allPayments;
	// all function definition
	function allPayments() {
		Admin.allPayments().then(function(responce) {
			vm.payments = responce.data;
			console.log("here")
			vm.loaderStart = false;
		}).catch(function(err) {
			toastr.error(err);
		})
	}

	$scope.Sort = function(val) {
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