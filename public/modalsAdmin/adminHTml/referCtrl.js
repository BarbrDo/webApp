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
  'ngTableParams',
  '$http',
  function($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $localStorage, ngTableParams, $uibModal, $http) {
    $scope.myobj.currentPage = 1;

    if ($localStorage.loggedIn == true) {
      $rootScope.LoginUser = true;
      $rootScope.loggedInUserDetail = $localStorage.loginInfo;
    } else {
      $rootScope.LoginUser = false;
    }
    $scope.data = {};
    $scope.user = {};
    $scope.admin = {};
    $scope.myadmin = {};
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
      console.log($scope.data);
      let obj = {
        referral: $stateParams._id
      }
      if ($scope.data.usertype) {
        obj.invite_as = $scope.data.usertype;
      }
      if ($scope.data.login) {
        obj.is_refer_code_used = $scope.data.login;
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

    $scope.sentGiftCard = function() {
      console.log($scope.mailContent);
      let obj = {
        to: $scope.referInfo[0].referral.email,
        content: $scope.mailContent
      }
      console.log(obj);
      Admin.sentGiftCard(obj).then(function(response) {
        toastr.success("Mail sent");
      })
    }

    // Admin module from here
    $scope.addAdmin = function() {
      console.log($scope.admin);
      console.log($scope.file);
      var formdata = new FormData();
      formdata.append("first_name", $scope.admin.first_name);
      formdata.append("last_name", $scope.admin.last_name);
      formdata.append("mobile_number", $scope.admin.mobile_number);
      formdata.append("password", $scope.admin.password);
      formdata.append("email", $scope.admin.email);
      if ($scope.file) {
        formdata.append("file", $scope.file);
      }

      // return $http({
      //   url: "/api/v2/signupadmin",
      //   method: 'POST',
      //   data: formdata,
      //   headers: { 'Content-Type': undefined},
      //   transformRequest: angular.identity
      // });

      // return false;
      Admin.addadmin(formdata).then(function(response) {
        console.log(response);
        toastr.success("Admin created successfully.");
        $state.go('allAdmin');
      }).catch(function(result) {
        console.log(result);
        toastr.error(result.data.err[0].msg);
      })
    }
    if ($state.current.name == 'edit_admin') {
      $scope.admin = {};
      $rootScope.LoginUserInfo = $localStorage.loginInfo
      Admin.getAdminInfo({
        _id: $localStorage.loginInfo._id
      }).then(function(response) {
        $scope.admin = response.data.data;
        console.log("admin info",response.data.data)
        $localStorage.loginInfo = response.data.data;
        $rootScope.imageDisplay = $localStorage.imgPath + response.data.data.picture
        console.log("response",response.data.data)
      })
    }
    $scope.updateAdminInfo = function() {
      console.log("===", $scope.admin)
      console.log("===-----", $scope.file)
      var formdata = new FormData();
      formdata.append("first_name", $scope.admin.first_name);
      formdata.append("last_name", $scope.admin.last_name);
      formdata.append("mobile_number", $scope.admin.mobile_number);
      formdata.append("password", $scope.admin.password);
      formdata.append("email", $scope.admin.email);
      formdata.append("_id", $scope.admin._id);
      if ($scope.file) {
        formdata.append("file", $scope.file);
      }
      Admin.updateAdminInfo(formdata).then(function(response) {
        console.log("response---00",response);
        $localStorage.loginInfo = response.data.data;
        $localStorage.imgPath = response.data.imagesPath;
        $rootScope.imageDisplay = $localStorage.imgPath + response.data.data.picture
        toastr.success("Admin updated successfully.");
        $state.go('dashboard');
      }).catch(function(result) {
        toastr.error("Error in updating admin fields.");
      })
    }
    $scope.updateAdminPassword = function() {
      $scope.myadmin._id = $scope.admin._id;
      Admin.updatePassword($scope.myadmin).then(function(response) {
        console.log(response);
        $state.go('allAdmin');
      })
    }


    $scope.allAdmin = function() {
      Admin.allAdmin().then(function(response) {
        console.log(response.data.data)
        $scope.adminData = response.data.data;
      })
    }
  }
]);