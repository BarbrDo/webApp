app_admin.controller("reportCtrl", reportCtrl);

function reportCtrl($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $uibModal, $timeout) {
	var vm = this;
	vm.allRecords = allRecords;
	vm.graphicData = graphicData;
	// all function definition

	function allRecords() {
		$scope.loaderStart = true;
	    var passingObj = {
	      page: $scope.myobj.currentPage,
	      count: 30
	    }
	    if ($scope.myobj.search) {
	      passingObj.search = $scope.myobj.search
	    }
		Admin.allRecords().then(function(responce) {
			console.log(responce.data.customer);
			$scope.loaderStart = false;
			vm.subscriptions = responce.data.subscription;
			vm.customer = responce.data.customer;
		}).catch(function(err) {
			toastr.error(err);
		})
	}
	function graphicData() {
		Admin.graphicData().then(function(responce) {
			vm.totalBarberSubscriptions = responce.data.barber_subscription;
			vm.totalShopSubscriptions = responce.data.shop_subscription
			vm.totalCustomer = responce.data.customer;
		}).catch(function(err) {
			toastr.error(err);
		})
	}
}