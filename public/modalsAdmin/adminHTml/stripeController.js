app_admin.controller("planCtrl", planCtrl);

function planCtrl($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $uibModal,$timeout) {
  var vm = this;
  $scope.user = {};
  vm.animationsEnabled = true;
  vm.edit = edit;
  vm.del = del;
  vm.open = open;
  vm.submitPlan = submitPlan;
  vm.cancel = cancel;
  vm.allPlans = allPlans;
  vm.loaderStart = true;
  /*All Function */
  function allPlans() {
    console.log("allPlans");
    Admin.featuringPlans().then(function(responce) {
      vm.plans = responce.data;
      vm.loaderStart = false;
    })
  }

  function edit(data) {
    console.log(data);
    $timeout(function() {
      vm.user = data;
      console.log(vm.user);
      vm.open(vm.user )
      console.log("inside edit");
    }, 100);
  }

  function del() {
    console.log("inside del");
  }

  function open(data) {
    vm.user = data;
    console.log("vm.user",vm.user);
    $rootScope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'instanceController12',
      controllerAs: 'vm',
      windowClass: 'transmitter_modal',
      scope: $scope,
      size: ' holder',
      resolve: {
        user: function () {
          return vm.user;
        }
      }
    });
  }

  function submitPlan() {
    console.log($scope.user);
    vm.loaderStart = true;
    // Admin.createPlan(vm.user).then(function(responce) {
    //   console.log(responce);
    //   vm.allPlans();
    //   $rootScope.$emit("MyEvent");
    // })
  }

  function cancel() {
    $rootScope.$emit("MyEvent");
  }
}

app_admin.controller('instanceController12', ['$uibModalInstance', '$scope', '$rootScope', function($uibModalInstance, $scope, $rootScope) {
  var vm = this;
  vm.cancel = cancel;
  $rootScope.$on("MyEvent", function(evt, data) {
    cancel();
  })

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }
}])