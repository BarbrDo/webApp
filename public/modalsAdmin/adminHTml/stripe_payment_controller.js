app_admin.controller("paymentCtrl", paymentCtrl);

function paymentCtrl($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $uibModal, $timeout) {
	var vm = this;
	vm.allPayments = allPayments;
	// all function definition
	function allPayments() {
		Admin.allPayments().then(function(responce) {
			vm.payments = responce.data;
			vm.loaderStart = false;
		}).catch(function(err) {
			toastr.error(err);
		})
	}
}