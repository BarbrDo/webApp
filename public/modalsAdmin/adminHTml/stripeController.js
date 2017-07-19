app_admin.controller("planCtrl", planCtrl);

function planCtrl($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $uibModal, $timeout,$localStorage) {
   if($localStorage.loggedIn){
    $rootScope.LoginUser = true;
  }
  else{
    $rootScope.LoginUser = false;
  }
    var vm = this;
    vm.animationsEnabled = true;
    vm.edit = edit;
    vm.del = del;
    vm.open = open;
    vm.oopen = oopen;
    vm.submitPlan = submitPlan;
    vm.cancel = cancel;
    vm.allPlans = allPlans;
    vm.loaderStart = true;
    vm.updatePlan = updatePlan;
    /*All Function */
    function allPlans() {
        console.log("allPlans");
        Admin.featuringPlans().then(function(responce) {
            vm.plans = responce.data;
            vm.loaderStart = false;
        }).catch(function (err) {
           toastr.error(err.data.err.message);
        })
    }
    function edit(data, status) {
      $scope.uniquieId = "disabled";
        $scope.update = "true";
        $scope.submit = "false";
        console.log("data", data);
        $timeout(function() {
            $scope.user = data;
            oopen($scope.user, status)
        }, 100);
    }
    function del(data) {
      console.log(data);
        var obj = {
          "id":data.id
        }
        console.log(obj);
         Admin.deletePlan(obj).then(function(responce) {
            console.log(responce);
            vm.allPlans();
        }).catch(function (err) {
           toastr.error(err.data.err.message);
        })
    }
    function open(data, status) {
      $scope.user = {};
      $scope.uniquieId = '';
      oopen(data,status)
    }
    function oopen(data, status) {
        console.log(data, status)
        if (status == 'add') {
            $scope.update = "false";
            $scope.submit = "true";
        } else {
            $scope.update = "true";
            $scope.submit = "false";
        }
        console.log("$scope.user", $scope.user)
        $rootScope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'instanceController12',
            scope: $scope,
            size: ' holder'
        });
    }
    function submitPlan() {
        console.log($scope.user);
        vm.loaderStart = true;
        Admin.createPlan($scope.user).then(function(responce) {
            console.log(responce);
            vm.allPlans();
            $rootScope.$emit("MyEvent");
        }).catch(function (err) {
           toastr.error(err.data.err.message);
        })
    }
    function cancel() {
        $rootScope.$emit("MyEvent");
    }
    function updatePlan() {
        console.log($scope.user);
        vm.loaderStart = true;
        Admin.updatePlan($scope.user).then(function(responce) {
          toastr.success('Stripe plan updated successfully.');
          vm.allPlans();
          $rootScope.$emit("MyEvent");
        }).catch(function (err) {
           toastr.error(err.data.err.message);
        })
    }
}

app_admin.controller('instanceController12', ['$uibModalInstance', '$scope', '$rootScope', function($uibModalInstance, $scope, $rootScope) {
    var vm = this;
    vm.cancel = cancel;
    $rootScope.$on("MyEvent", function(evt, data) {
        cancel();
    })

    function cancel() {
      $scope.user = {};
        $uibModalInstance.dismiss('cancel');
      }
}])
