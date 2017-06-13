app_admin.controller("AdminCtrl", ['$scope', '$rootScope', '$location', 'Admin', '$filter', '$log','$stateParams', function($scope, $rootScope, $location, Admin, $filter, $log, $stateParams) {

  $scope.user = {};
  $scope.myobj = {};
  $scope.myobj.currentPage = 1;
  $scope.bigTotalItems = 300;
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


  $scope.custAppoint = function() {
    Admin.appointments()
      .then(function(response) {
        $rootScope.upcoming = response.data.data.upcoming;
        $rootScope.complete = response.data.data.complete;
      });

  };


  $scope.addcustomer = function() {
    Admin.addCustomer($scope.user)
      .then(function(response) {});
  };

  $scope.appointdetail = function(appointment) {
  $rootScope.viewappoint = appointment
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
      });


  };

  var obj = {
    'latitude': "30.708225",
    'longitude': "76.7029445"
  }

  $scope.query = {}
  $scope.queryBy = '$'


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
        
        let shp = [];
        let objj = {};
        var len = response.data.data.length;
        for (var i = 0; i < len; i++) {
          let k = 0;
          for (var j = 0; j < response.data.data[i].shopinfo[0].chairs.length; j++) {
            if (response.data.data[i].shopinfo[0].chairs[j].barber_id) {
              k++;

            }
          }
           
          let objj = {
            shopsdata : response.data.data[i],
            shop_id: response.data.data[i].shopinfo[0]._id,
            totalBarbers: k
          };
          shp.push(objj);  
        }
        $rootScope.shops = shp;
        $scope.myobj.totalItems = response.data.count;

          
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

    var valfromActive = $scope.activeSelected;
     var valfromVerify = $scope.verifySelected;
     var valfromDelete = $scope.deleteSelected;
     if(valfromActive == 'true')
     {
      $scope.activatecust(customer);
     }
      if(valfromActive == 'false')
     {
      $scope.deactivecust(customer);
     }
      if(valfromVerify == 'true')
     {
      $scope.verifybarber(customer);
     }
      if(valfromVerify == 'false')
     {
      $scope.disapprovebarber(customer);
     }
      if(valfromDelete == 'true')
     {
        $scope.deletecustomer(customer);
     }
      if(valfromDelete == 'false')
     {
      $scope.undeletecustomer(customer);
     }
    Admin.updateCustomer(customer)
      .then(function(response) {
        $rootScope.customers = response.data;
      });

  };

  $scope.updatebarber = function(barber) {
    $scope.barber = barber;
     var valfromActive = $scope.activeSelected;
     var valfromVerify = $scope.verifySelected;
     var valfromDelete = $scope.deleteSelected;
     if(valfromActive == 'true')
     {
      $scope.activatebarber(barber);
     }
      if(valfromActive == 'false')
     {
      $scope.deactivatebarber(barber);
     }
      if(valfromVerify == 'true')
     {
      $scope.verifybarber(barber);
     }
      if(valfromVerify == 'false')
     {
      $scope.disapprovebarber(barber);
     }
      if(valfromDelete == 'true')
     {
      $scope.undeletebarber(barber);
     }
      if(valfromDelete == 'false')
     {
      $scope.deletebarber(barber);
     }
    Admin.updateBarber(barber)
      .then(function(response) {
        $rootScope.barbers = response.data;
      });

  };

  $scope.updateshopowner = function(shop) {
    $scope.shop = shop;
     var valfromActive = $scope.activeSelected;
     var valfromVerify = $scope.verifySelected;
     var valfromDelete = $scope.deleteSelected;
     if(valfromActive == 'true')
     {
      console.log(valfromActive);
      $scope.activateshop(shop);
      
     }
      if(valfromActive == 'false')
     {
      console.log(valfromActive);
      $scope.deactiveshop(shop);
      
     }
      if(valfromVerify == 'true')
     {
      $scope.verifyshop(shop);
     }
      if(valfromVerify == 'false')
     {
      $scope.disapproveshop(shop);
     }
      if(valfromDelete == 'true')
     {
      $scope.undeleteshop(shop);
     }
      if(valfromDelete == 'false')
     {
      $scope.deleteshop(shop);
     }
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

  $scope.viewbarbdetail = function(barber) {
    Admin.barberDetail(barber)
      .then(function(response) {
       $rootScope.barberdetail = response.data.data[0];

      });

  };


  

  $scope.updateshop = function(shop) {
    $scope.shop = shop;
    Admin.updateShopinfo(shop)
      .then(function(response) {
        $rootScope.shops = response.data;
      });

  };

  $scope.deleteconfirmchair = function(chair) {
    $scope.chair = chair;
  };

  $scope.deletechair = function(chair) {
    Admin.deleteChair($scope.chair)
      .then(function(response) {});


  };


  $scope.deletebarber = function(barber) {
    Admin.deleteBarber($scope.barber)
      .then(function(response) {
        $rootScope.barbers = response.data;
      });

  };
  $scope.undeletebarber = function(barber) {
    Admin.undeleteBarber($scope.barber)
      .then(function(response) {
        $rootScope.barbers = response.data;
      });

  };


  $scope.deleteshop = function(shop) {
    $scope.shop = shop;
    Admin.deleteShop(shop)
      .then(function(response) {
        $rootScope.shops = response.data;
      });

  };

    $scope.undeleteshop = function(shop) {
      $scope.shop = shop;
    Admin.undeleteShop(shop)
      .then(function(response) {
        $rootScope.shops = response.data;
      });

  };



  $scope.deletecustomer = function(customer) {
    $scope.customer = customer;
    Admin.deleteCustomer($scope.customer)
      .then(function(response) {
        $rootScope.customers = response.data;
      });
  };

  $scope.undeletecustomer = function(customer) {
    $scope.customer = customer;
    Admin.undeleteCustomer($scope.customer)
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

  $scope.deactiveshop = function(shop) {

    $scope.shop = shop;
    Admin.deactiveShop(shop)
      .then(function(response) {
        $rootScope.deactiveshops = response.data;
      });

  };

  $scope.activateshop = function(shop) {

    $scope.shop = shop;
    Admin.activateShop(shop)
      .then(function(response) {
        $rootScope.deactiveshops = response.data;
      });

  };

  $scope.disapproveshop = function(shop) {

    $scope.shop = shop;
    Admin.disapproveShop(shop)
      .then(function(response) {
        $rootScope.deactiveshops = response.data;
      });

  };

  $scope.verifyshop = function(shop) {
    $scope.shop = shop;
    Admin.verifyShop(shop)
      .then(function(response) {
        $rootScope.deactiveshops = response.data;
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
    $rootScope.customerdetail = customer;

  };

  
  $scope.shopdetail = function(shop) {
    // $rootScope.delchair = shop.shopinfo[0];
      Admin.shopDetail(shop)
      .then(function(response) {
         $rootScope.shopdetailview = response.data.data[0];
         $rootScope.chairdetails = response.data.data[0].shopinfo[0].chairs;
          let shopsdet = [];
        let object = {};
        var len = response.data.data.length;
        for (var i = 0; i < len; i++) {
          let k = 0;
          for (var j = 0; j < response.data.data[i].shopinfo[0].chairs.length; j++) {
            if (response.data.data[i].shopinfo[0].chairs[j].barber_id) {
              k++;
            }
          }
           
          let object = {
            totalBarbers: k
          };
          shopsdet.push(object);
          $rootScope.totalbarbers = object;

        }          

      });
 
  };

  $scope.viewshop = function(shop) {
      Admin.viewShopDetail(shop)
      .then(function(response) {
         $rootScope.shopdetailview = response.data.data[0];
         $rootScope.chairdetails = response.data.data[0].shopinfo[0].chairs;
         let shopsdet = [];
        let object = {};
        var len = response.data.data.length;
        for (var i = 0; i < len; i++) {
          let k = 0;
          for (var j = 0; j < response.data.data[i].shopinfo[0].chairs.length; j++) {
            if (response.data.data[i].shopinfo[0].chairs[j].barber_id) {
              k++;
            }
          }
           
          let object = {
            totalBarbers: k
          };
          shopsdet.push(object);
          $rootScope.totalbarbers = object;
        }
      });
 
  };


  $scope.chairdetail = function(chair) {
    $rootScope.chairdetailview = chair;
  }

  $scope.addchair = function(chair) {
    Admin.addChair(chair)
      .then(function(response) {});
  };


  Admin.countBarber()
    .then(function(response) {
      $rootScope.totalbarber = response.data;
    });


  Admin.countAppointment()
    .then(function(response) {
      $rootScope.totalappointment = response.data;
    });

  Admin.countShop()
    .then(function(response) {
      $rootScope.totalshop = response.data;
    });

  Admin.countCustomer()
    .then(function(response) {
      $rootScope.totalcustomer = response.data;
    });

    // Admin.barberDetail($stateParams.id)
    //   .then(function(response) {
    //     $rootScope.barberdetail = response.data.data[0];
    //   });



}]);