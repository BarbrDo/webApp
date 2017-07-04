angular.module('BarbrDoApp').controller('ProfileCtrl', function($scope, $rootScope, $location, $window, $auth, Account, toastr, $http, shop) {
    if ($window.localStorage.user) {
        $scope.profile = JSON.parse($window.localStorage.user);
        console.log($scope.profile)
    }
    $scope.imgPath = $window.localStorage.imagePath;

    $scope.shop = function() {
        shop.shopInfo().then(function(response) {
            $rootScope.shopinfo = response.data.user.shop[0];
            var object = {};
            var k = 0;
            for (var j = 0; j < response.data.user.shop[0].chairs.length; j++) {
                if (response.data.user.shop[0].chairs[j].barber_id) {
                    k++;
                }
            }
            var object = {
                totalBarbers: k
            };
            $rootScope.totalbarbers = object.totalBarbers;
        });
    };


    $scope.updateProfile = function() {
        var fs = new FormData();
        fs.append("first_name", $scope.profile.first_name);
        fs.append("last_name", $scope.profile.last_name);
        fs.append("gender", $scope.profile.gender);
        fs.append("mobile_number", $scope.profile.mobile_number);
        fs.append("radius_search", $scope.profile.radius_search);
        if ($scope.profile.file) {
            fs.append("profileImage", $scope.profile.file);
        }
        $http.put("/api/v1/account", fs, {
                headers: {
                     'Content-Type': undefined,
                    'user_id': $scope.profile._id
                }
            })
            .success(function(response) {
                if (response) {
                    $rootScope.currentUser = response.user;
                    $window.localStorage.user = JSON.stringify(response.user);
                    toastr.success("User profile updated successfully.");
                }
            })
            .error(function(err) {
                $scope.messages = {
                    error: Array.isArray(response.user) ? response.user : [response.user]
                };
                toastr.error("Error while updating.");
            });
    };

    $scope.updateshopinfo = function(data) {
        Account.updateShop(data)
            .then(function(response) {
                toastr.success('Shop Information Updated Successfully');
            })
            .catch(function(response) {
                toastr.success('Error in updating Shop.');
            });

    };


    $scope.changePassword = function() {
        Account.changePassword($scope.profile)
            .then(function(response) {
                toastr.success('Password changed successfully.');
            })
            .catch(function(response) {
                toastr.success('Error in updating password.');
            });
    };

    $scope.link = function(provider) {
        toastr.warning('Work in progress');
        return false;
        $auth.link(provider)
            .then(function(response) {
                $scope.messages = {
                    success: [response.data]
                };
            })
            .catch(function(response) {
                $window.scrollTo(0, 0);
                $scope.messages = {
                    error: [response.data]
                };
            });
    };
    $scope.unlink = function(provider) {
        toastr.warning('Work in progress');
        return false;
        $auth.unlink(provider)
            .then(function() {
                $scope.messages = {
                    success: [response.data]
                };
            })
            .catch(function(response) {
                $scope.messages = {
                    error: [response.data]
                };
            });
    };

    $scope.deleteAccount = function() {
        toastr.warning('Work in progress');
        return false;
        Account.deleteAccount()
            .then(function() {
                $auth.logout();
                delete $window.localStorage.user;
                $location.path('/');
            })
            .catch(function(response) {
                $scope.messages = {
                    error: [response.data]
                };
            });
    };
});