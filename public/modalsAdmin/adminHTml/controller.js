app_admin.controller("AdminCtrl", ['$scope', '$rootScope', '$location', 'Admin', '$filter', '$log', function($scope, $rootScope, $location, Admin, $filter, $log) {


    $scope.myobj = {};
    $scope.myobj.currentPage = 1;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;

    $scope.pageChanged = function() {
      var passingObj = {
        page: $scope.myobj.currentPage,
        count: 10
      }
      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }
      Admin.barbers(passingObj)
        .then(function(response) {
          $scope.myobj.totalItems = response.data.count;
          $rootScope.barbers = response.data.data;
        
        });

    };



    $scope.signup = function() {
       Admin.signup()
        .then(function(response) {
          console.log("signup",response)
        });
    
    };



    $scope.custpageChanged = function() {
      var passingObj = {
        page: $scope.myobj.currentPage,
        count: 10
      }

      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }
      Admin.customersAll(passingObj)
        .then(function(response) {
          $scope.myobj.totalItems = response.data.count;
          $rootScope.customers = response.data.data;
        });

      $log.log('Page changed to: ' + $scope.myobj.currentPage);

    };

    var obj = {
      'latitude': "30.708225",
      'longitude': "76.7029445"
    }


    $scope.shoppageChanged = function() {
      var passingObj = {
        page: $scope.myobj.currentPage,
        count: 10
      }

      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }

      Admin.shopsAll(passingObj)
        .then(function(response) {
          $scope.myobj.totalItems = response.data.count;
          $rootScope.shops = response.data.data;
        });

        Admin.shopList(obj)
        .then(function(response) {
          $rootScope.barberinshops = response.data.data ;
          console.log("shop",response.data.data)
        });
      $log.log('Page changed to: ' + $scope.myobj.currentPage);

    };

    $scope.Sort = function(val) {
      if ($scope.sort == val) {
        $scope.reverse = !$scope.reverse;
        //return;
      }
      $scope.sort = val;
      $('th a i').each(function() {
        //alert(this.className);
        $(this).removeClass().addClass('icon-sort');
      });

      if ($scope.reverse) {
        $('th .' + val + ' i').removeClass().addClass('icon-chevron-up');
      } else {
        $('th .' + val + ' i').removeClass().addClass('icon-chevron-down');
      }
    };




   

    $scope.updatecustomer = function(customer) {
      $scope.customer = customer;
      Admin.updateCustomer(customer)
        .then(function(response) {
          $rootScope.customers = response.data;
        });

    };

    $scope.updatebarber = function(barber) {
      $scope.barber = barber;
      Admin.updateBarber(barber)
        .then(function(response) {
          $rootScope.barbers = response.data;
        });

    };

    $scope.updateshop = function(shop) {
      $scope.shop = shop;
      Admin.updateShop(shop)
        .then(function(response) {
          $rootScope.shops = response.data;
        });

    };

     $scope.updatechair = function(chair) {
      $scope.chair = chair;
      Admin.updateChair(chair)
        .then(function(response) {
          $rootScope.shops = response.data;
          console.log("chairs",response.data);
        });

    };



    $scope.deleteconfirmbarber = function(barber) {
          $scope.barber = barber;
          console.log("confirm",barber)
        };

    $scope.deletebarber = function(barber) {
      Admin.deleteBarber($scope.barber)
        .then(function(response) {
          $rootScope.barbers = response.data;
          console.log("deleted",response.data);
        });
      console.log("del",$scope.barber);
    };

    // $scope.deleteshop = function(shop) {
    //   $scope.shop = shop;
    //   Admin.deleteShop(shop)
    //     .then(function(response) {
    //       $rootScope.shops = response.data;
    //       console.log("shop", shop);
    //     });

    // };

       $scope.deleteconfirmcustomer = function(customer) {
        $scope.customer = customer;
    };

    $scope.deletecustomer = function(customer) {
      $scope.customer = customer;
      Admin.deleteCustomer($scope.customer)
        .then(function(response) {
          $rootScope.customers = response.data;
        });
    };

     $scope.deactivecust = function(customer) {

      $scope.customer = customer;
      Admin.deactiveCustomer(customer)
        .then(function(response) {
          $rootScope.deactivecustomers = response.data;
          console.log("deactivated",response.data);
        });

    };

    $scope.cancel = function(index) {
      if ($scope.editing !== false) {
        $scope.appkeys[$scope.editing] = $scope.newField;
        $scope.editing = false;
      }
    };

    $scope.custdetails = function(customer) {

      $scope.customerdetail = customer;

    };

    $scope.barbdetail = function(barber) {
      $scope.barberdetail = barber;
    };

    $scope.shopdetail = function(shop) {
      $scope.shopdetailview = shop;
      console.log("det",shop);
    };

    $scope.addbarber = function()
    {
       Admin.addBarber()
        .then(function(response) {
          console.log("res",response);
        });
    };


    Admin.countBarber()
        .then(function(response) {
          $rootScope.totalbarber = response.data ; 
        });

    Admin.countShop()
        .then(function(response) {
         $rootScope.totalshop = response.data ; 
        });

    Admin.countCustomer()
        .then(function(response) {
          $rootScope.totalcustomer = response.data ; 
        });


  }]);