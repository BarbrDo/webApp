app_admin.controller("AdminCtrl", ['$scope', '$rootScope', '$location', 'Admin', '$filter', '$log',function($scope, $rootScope, $location, Admin, $filter, $log, $routeParams) {

    $scope.user = {};
    $scope.myobj = {};
    $scope.myobj.currentPage = 1;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    $scope.fieldDisabled = false;

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



       $scope.addcustomer = function() {
       Admin.addCustomer($scope.user)
        .then(function(response) {
        });
    
    };


    $scope.query = {}
    $scope.queryBy = '$'
    

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
             console.log("all custs",response);
        });

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
          console.log("all shops",response.data.data);
        });

        Admin.shopList(obj)
        .then(function(response) {
          $rootScope.barberinshops = response.data.data ;
          console.log("all shops having barbers",response.data.data);
        });

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
      $scope.shop = shop ; 
      Admin.updateShop(shop)
        .then(function(response) {    
        });
    };

     $scope.updatechair = function(chair) {
      $scope.chair = chair;
      Admin.updateChair(chair)
        .then(function(response) {
          $rootScope.shops = response.data;
        });

    };
    
    $scope.deleteconfirmchair = function(chair) {
          $scope.chair = chair;
          console.log("shop id",$routeParams.id);
        };

    $scope.deletechair = function(chair) {
      Admin.deleteChair($scope.chair)
        .then(function(response) {
          console.log("response",response);
        });
        $rootScope.idParam = $routeParams.id;
         
    };


    $scope.deleteconfirmbarber = function(barber) {
          $scope.barber = barber;
        };

    $scope.deletebarber = function(barber) {
      Admin.deleteBarber($scope.barber)
        .then(function(response) {
          $rootScope.barbers = response.data;
        });
     
    };

    $scope.deleteconfirmshop = function(shop) {
          $scope.delshop = shop;
          
        };

    $scope.deleteshop = function(shop) {
      Admin.deleteShop($scope.delshop)
        .then(function(response) {
          $rootScope.shops = response.data;
        });
        
    };

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
        });

    };

    $scope.activatecust = function(customer) {

      $scope.customer = customer;
      Admin.activateCustomer(customer)
        .then(function(response) {
          $rootScope.deactivecustomers = response.data;
        });

    };

    $scope.disapprovecust = function(customer) {

      $scope.customer = customer;
      Admin.disapproveCustomer(customer)
        .then(function(response) {
          $rootScope.deactivecustomers = response.data;
        });

    };

    $scope.verifycust = function(customer) {

      $scope.customer = customer;
      Admin.verifyCustomer(customer)
        .then(function(response) {
          $rootScope.deactivecustomers = response.data;
        });

    };

    $scope.deactivatebarber = function(barber) {
      $scope.barber = barber;
      Admin.deactiveBarber(barber)
        .then(function(response) {
          $rootScope.deactivebarbers = response.data;
        });
    };

    $scope.disapprovebarber = function(barber) {
      $scope.barber = barber;
      Admin.disapproveBarber(barber)
        .then(function(response) {
          $rootScope.deactivebarbers = response.data;
        });
    };

    $scope.verifybarber = function(barber) {
      $scope.barber = barber;
      Admin.verifyBarber(barber)
        .then(function(response) {
          $rootScope.deactivebarbers = response.data;
        });
    };

     $scope.activatebarber = function(barber) {
      $scope.barber = barber;
      Admin.activateBarber(barber)
        .then(function(response) {
          $rootScope.deactivebarbers = response.data;
        });
    };

    
    $scope.cancel = function(index) {
      if ($scope.editing !== false) {
        $scope.editing = false;
      }
    };

    $scope.custdetails = function(customer) {

      $scope.customerdetail = customer;

    };

    $scope.barbdetail = function(barber) {
      $rootScope.barberdetail = barber;
    };

    $scope.shopdetail = function(shop) {
      $rootScope.shopdetailview = shop;
      $rootScope.chairdetails = shop.shopinfo;
    };

    $scope.chairdetail = function(chair) {
      $rootScope.chairdetailview = chair;
    }

    $scope.addchair = function(chair)
    {
       Admin.addChair(chair)
        .then(function(response) {
        });
    };


    Admin.countBarber()
        .then(function(response) {
          $rootScope.totalbarber = response.data ; 
        });


    Admin.countAppointment()
        .then(function(response) {
          $rootScope.totalappointment = response.data ; 
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