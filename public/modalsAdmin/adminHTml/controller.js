app_admin.controller("AdminCtrl", ['$scope', '$rootScope', '$location', 'Admin', '$filter', '$log', '$stateParams', function($scope, $rootScope, $location, Admin, $filter, $log, $stateParams) {

  $scope.user = {};
  $scope.myobj = {};
  $scope.myobj.currentPage = 1;
  $scope.bigTotalItems = 175;
  $scope.bigCurrentPage = 1;
  $scope.fieldDisabled = false;



  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }


  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };


  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  // $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };



  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }

  $scope.pageChanged = function() {
    var passingObj = {
      page: $scope.myobj.currentPage,
      count: 30
    }
    if ($scope.myobj.search) {
      passingObj.search = $scope.myobj.search
    }
    Admin.barbers(passingObj)
      .then(function(response) {
        $scope.myobj.totalItems = response.data.count / 3;
        $rootScope.barbers = response.data.data;
      });

  };


  $scope.custAppoint = function(customer) {
    $scope.customer = customer;
    Admin.appointments(customer)
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
      count: 30
    }
    if ($scope.myobj.search) {
      passingObj.search = $scope.myobj.search
    }
    Admin.customersAll(passingObj)
      .then(function(response) {
        $scope.myobj.totalItems = response.data.count / 3;
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
      count: 30
    }

    if ($scope.myobj.search) {
      passingObj.search = $scope.myobj.search
    }

    Admin.shopsAll(passingObj)
      .then(function(response) {
        var shp = [];
        var objj = {};
        var len = response.data.data.length;
        for (var i = 0; i < len; i++) {
          var k = 0;
          for (var j = 0; j < response.data.data[i].shopinfo[0].chairs.length; j++) {
            if (response.data.data[i].shopinfo[0].chairs[j].barber_id) {
              k++;

            }
          }

          var objj = {
            shopsdata: response.data.data[i],
            shop_id: response.data.data[i].shopinfo[0]._id,
            totalBarbers: k
          };
          shp.push(objj);
        }
        $rootScope.shops = shp;
        $scope.myobj.totalItems = response.data.count / 3;
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
    var valfromdelete = $scope.deleteSelected;
    if (valfromActive == 'true') {
      $scope.activatecust(customer);
    }
    if (valfromActive == 'false') {
      $scope.deactivecust(customer);
    }
    if (valfromVerify == 'true') {
      $scope.verifybarber(customer);
    }
    if (valfromVerify == 'false') {
      $scope.disapprovebarber(customer);
    }
    if (valfromdelete == 'true') {
      $scope.deletecustomer(customer);
    }
    if (valfromdelete == 'false') {
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
    var valfromdelete = $scope.deleteSelected;
    if (valfromActive == 'true') {
      $scope.activatebarber(barber);
    }
    if (valfromActive == 'false') {
      $scope.deactivatebarber(barber);
    }
    if (valfromVerify == 'true') {
      $scope.verifybarber(barber);
    }
    if (valfromVerify == 'false') {
      $scope.disapprovebarber(barber);
    }
    if (valfromdelete == 'true') {
      $scope.deletebarber(barber);
    }
    if (valfromdelete == 'false') {
      $scope.undeletebarber(barber);
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
    var valfromdelete = $scope.deleteSelected;
    if (valfromActive == 'true') {
      $scope.activateshop(shop);

    }
    if (valfromActive == 'false') {
      $scope.deactiveshop(shop);

    }
    if (valfromVerify == 'true') {
      $scope.verifyshop(shop);
    }
    if (valfromVerify == 'false') {
      $scope.disapproveshop(shop);
    }
    if (valfromdelete == 'true') {
      $scope.deleteshop(shop);
    }
    if (valfromdelete == 'false') {
      $scope.undeleteshop(shop);
    }
    Admin.updateShop(shop)
      .then(function(response) {});
  };


  $scope.updateshop = function(shop) {
    $scope.shop = shop;
    Admin.updateShopinfo(shop)
      .then(function(response) {
        $rootScope.shops = response.data;
      });

  };

  $scope.deleteconfirmchair = function(chair,shop) {
    $scope.chair = chair;
  };

  $scope.deletechair = function(chair,shop) {
    Admin.deleteChair($scope.chair,$stateParams.id,shop)
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

  $scope.chairdetail = function() {
    Admin.chairDetail($stateParams.id)
      .then(function(response) {
        $rootScope.chairdet = response.data.data[0].chairs[0];
      });
  };

  $scope.shopdetail = function() {

    setTimeout(function() {
      Admin.shopDetail($stateParams.id)
        .then(function(response) {
          $rootScope.shopdetailview = response.data.data[0];
          $rootScope.chairdetails = response.data.data[0].shopinfo[0].chairs;
          var shopsdet = [];
          var object = {};
          var len = response.data.data.length;
          for (var i = 0; i < len; i++) {
            var k = 0;
            for (var j = 0; j < response.data.data[i].shopinfo[0].chairs.length; j++) {
              if (response.data.data[i].shopinfo[0].chairs[j].barber_id) {
                k++;
              }
            }

            var object = {
              totalBarbers: k
            };
            shopsdet.push(object);
            $rootScope.totalbarbers = object;
          }


        });
    }, 1000);
  };


  $scope.addchair = function(chair) {
    Admin.addChair(chair)
      .then(function(response) {

      });
  };


  $scope.updatechair = function(chair, id) {
    Admin.updateChair(chair, id)
      .then(function(response) {});
  };



  $scope.countall = function() {
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

    Admin.countBarber()
      .then(function(response) {
        $rootScope.totalbarber = response.data;
      });
  };

  $scope.barberdetails = function() {
    setTimeout(function() {
      Admin.barberDetail($stateParams.id)
        .then(function(response) {
          $rootScope.barberdetail = response.data.data[0];
        });
    }, 500);
  };

  $scope.customerdetails = function() {

    setTimeout(function() {
      Admin.custDetail($stateParams.id)
        .then(function(response) {
          $rootScope.customerdetail = response.data.data[0];
        });
    }, 500);


  };

}]);