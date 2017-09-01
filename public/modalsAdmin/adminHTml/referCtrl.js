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
    $scope.user = {};
    $scope.updateButton = false;
    $scope.referObj = {
      currentPage: 1
    };
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
        $scope.myobj.totalItems = response.data.count;
        console.log("response is", response.data.data)
        $rootScope.barbers = response.data.data;
      }).catch(function(result) {
        console.log("result", result);
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }
    $scope.particularUserData = function() {
      $scope.loaderStart = true;
      let obj = {
        referral: $stateParams._id
      }
      if($scope.data.usertype){
        obj.invite_as=$scope.data.usertype;
      }
      if($scope.data.login){
        obj.is_refer_code_used=$scope.data.login;
      }
      console.log(obj)
      Admin.getUserData(obj).then(function(response) {
        console.log(response);
        $scope.referInfo = response.data.data;
        $scope.loaderStart = false;
      })
    }
    $scope.shop_invites = function() {
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
        $scope.referObj.totalItems = response.data.count;
        $scope.shops = response.data.data;
      }).catch(function(result) {
        console.log("result", result);
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }
    if ($state.current.name == 'add_invited_shop') {
      console.log("add_invited_shop");
      let passData = {
        _id: $stateParams._id
      }
      Admin.getInviteShopProfile(passData).then(function(response) {
        console.log(response);
        $scope.user = response.data.data[0];
        $scope.user.latitude = response.data.data[0].latLong[1];
        $scope.user.longitude = response.data.data[0].latLong[0];
      })
    }
    $scope.addcustomer = function(params) {
      $scope.loaderStart = true;
      console.log($scope.user)
      Admin.addCustomer($scope.user).then(function(response) {
        let passData = {
          _id: $stateParams._id
        }
        Admin.updateInviteShopProfile(passData).then(function(response) {
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
    $scope.reject = function(id) {
      let passData = {
        _id: id
      }
      Admin.deleteInviteShopProfile(passData).then(function(response) {
        console.log(response);
        $scope.loaderStart = false;
        $state.go('shop_invites');
        $scope.shop_invites();
      })
    }
    $scope.allPlans = function() {
      Admin.featuringPlans().then(function(response) {
        $scope.myplans = response.data.data
      })
    }
    $scope.addPlan = function() {
      console.log($scope.user);
      Admin.createPlan($scope.user).then(function(response) {
        console.log(response.data.msg)
        toastr.success(response.data.msg);
        $state.go('plans');
      })
    }
    if ($state.current.name == 'edit_plan') {
      $scope.updateButton = true;
      console.log("edit plan");
      let obj = {
        _id: $stateParams.id
      }
      Admin.getPlanById(obj).then(function(response) {
        $scope.user = response.data.data
      })
    }

    $scope.passData = function(data) {
      console.log(data);
      $scope.user.city = data.formatted.city
      $scope.user.state = data.formatted.state
      $scope.user.zip = data.formatted.zip
      $scope.user.latitude = data.formatted.latitude;
      $scope.user.longitude = data.formatted.longitude;
      if (data.formatted.number) {
        $scope.user.street_address = data.formatted.number + ", " + data.formatted.street;
      } else if (data.formatted.street) {
        $scope.user.street_address = data.formatted.street
      } else {
        $scope.user.street_address = "";
      }

    }
    $scope.updatePlan = function(data) {
      console.log(data)
      Admin.updatePlan(data).then(function(response) {
        toastr.success('Plan Updated successfully.');
        $state.go('plans');
      }).catch(function(result) {
        console.log(result);
        toastr.error(result.data.msg);
      })
    }
    $scope.saveShop = function() {
      $scope.loaderStart = true;
      let passObj = $scope.user;
      if ($scope.detail) {
        passObj.address = $scope.detail.formatted.formatted;
        passObj.street_address = $scope.user.street_address;
        passObj.latitude = $scope.detail.formatted.latitude;
        passObj.longitude = $scope.detail.formatted.longitude;
      } else {
        passObj.latitude = $scope.user.latLong[1];
        passObj.longitude = $scope.user.latLong[0];
      }
      console.log(passObj)
      Admin.saveShopInfo(passObj).then(function(response) {
        let passData = {
          _id: $scope.user._id
        }
        Admin.deleteInviteShopProfile(passData).then(function(response) {
          console.log(response);
          $scope.loaderStart = false;
          $state.go('shop_invites');
          $scope.shop_invites();
        })
        toastr.success("Shop added successfully.")
      }).catch(function(response) {
        toastr.error("Error in adding shop");
      })
    }

    $scope.sentGiftCard = function(){
      console.log($scope.mailContent);
      let obj = {
        to:$scope.referInfo[0].referral.email,
        content:$scope.mailContent
      }
      console.log(obj);
      Admin.sentGiftCard(obj).then(function(response) {
        toastr.success("Mail sent");
      })
    }
  }
]);