angular.module('BarbrDoApp')
  .controller('ShopCtrl', function($scope, $rootScope, $location, Account, $routeParams) {



    $scope.shopdetails = function(shop) {
      $location.path('/shopdetails/' + shop._id);
      $rootScope.shopdetail = shop;
      $rootScope.barbersData = shop.barbers;
      console.log("Selected Shop :", $rootScope.shopdetail);
      console.log("barbers :", $rootScope.barbersData);
      $scope.id = $routeParams._id;

    };
    if (!$rootScope.shopdetail && !$rootScope.barbersData) {
      // console.log("$scope.shops",$scope.shops);
      var obj = {
        'latitude': "30.708225",
        'longitude': "76.7029445"
      }
      Account.shopList(obj)
        .then(function(data) {
          $scope.shops = data.data;
          console.log(data);
          for (var i = 0; i < data.data.length; i++) {
            if ($routeParams._id == data.data[i]._id) {
              $rootScope.shopdetail = data.data[i]
              $rootScope.barbersData = data.data[i].barbers;
            }
          }
        })
    }
  });