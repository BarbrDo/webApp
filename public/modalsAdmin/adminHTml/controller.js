app_admin.controller("AdminCtrl", ['$scope', '$rootScope', '$location', 'Admin', '$filter', '$log', '$stateParams', '$state' ,'toastr', function($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state,toastr) {

  $scope.user = {};
  $scope.myobj = {};
  $scope.myobj.currentPage = 1;
  $scope.bigTotalItems = 175;
  $scope.bigCurrentPage = 1;
  $scope.fieldDisabled = false;
  console.log("add_shops controller");


  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }


  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };
  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };


  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.popup1 = {
    opened: false
  };
  $scope.popup2 = {
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
    $scope.loaderStart = true;
    var passingObj = {
      page: $scope.myobj.currentPage,
      count: 30
    }
    if ($scope.myobj.search) {
      passingObj.search = $scope.myobj.search
    }
    Admin.barbers(passingObj)
      .then(function(response) {
        $scope.loaderStart = false;
        $scope.myobj.totalItems = response.data.count / 3;
        $rootScope.barbers = response.data.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })

  };


  // $scope.custAppoint = function(customer) {
  //   $scope.customer = customer;
  //   Admin.appointments(customer)
  //     .then(function(response) {
  //       $rootScope.upcoming = response.data.data.upcoming;
  //       $rootScope.complete = response.data.data.complete;
  //     });

  // };

  $scope.viewappointment = function() {
    $scope.loaderStart = true;
    Admin.custAppoints($stateParams.id)
      .then(function(response) {
        console.log(response)
        $scope.loaderStart = false;
        $rootScope.upcoming = response.data.data.upcoming;
        $rootScope.complete = response.data.data.complete;
        $rootScope.custname = response.data.data.upcoming[0].customer_name;
      }).catch(function(result) {
        $scope.loaderStart = false;
        console.log(result)
        $scope.messages = result.data.msg
      })
  }

  $scope.barberappoint = function() {
    $scope.loaderStart = true;
    $rootScope.showme = true;
    Admin.barberAppoints($stateParams.id)
      .then(function(response) {
        $scope.loaderStart = false;
        $rootScope.pending = response.data.data.pending;
        $rootScope.booked = response.data.data.booked;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  }

   $scope.barberappointmentsfunc = function(appointment) {
    $rootScope.appointment = appointment;
  }

  $scope.confirmappointment = function() {
    $scope.loaderStart = true;
    Admin.confirmAppoint($rootScope.appointment)
      .then(function(response) {
       $scope.loaderStart = false;
       toastr.success('Your appointment is confirmed Successfully');
        history.go(0);
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  }

  $scope.markcomplete = function() {
    $scope.loaderStart = true;
    Admin.markComplete($rootScope.appointment, $stateParams.id)
      .then(function(response) {
      $scope.loaderStart = false;
      toastr.success('Your appointment is completed Successfully');
        history.go(0);
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  }

  $scope.rescheduleappoint = function(time) {
    $rootScope.time = time
  }

  $scope.confirmreschedule = function() {
    $scope.loaderStart = true; 
    Admin.rescheduleAppoint($rootScope.appointment,$rootScope.time)
      .then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Your appointment is Reschedule Successfully');
        history.go(0);
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  }

  $scope.addcustomer = function(params) {
    $scope.loaderStart = true;
    Admin.addCustomer($scope.user)
      .then(function(response) {
        $scope.loaderStart = false;
        $state.go(params);
        toastr.success(params + '' + 'is Added Successfully');
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  };

  $scope.appointdetail = function(appointment) {
    $rootScope.viewappoint = appointment
  };



  $scope.query = {}
  $scope.queryBy = '$'


  $scope.custpageChanged = function() {
    $scope.loaderStart = true;
    var passingObj = {
      page: $scope.myobj.currentPage,
      count: 30
    }
    if ($scope.myobj.search) {
      passingObj.search = $scope.myobj.search
    }
    Admin.customersAll(passingObj)
      .then(function(response) {
        $scope.loaderStart = false;
        $scope.myobj.totalItems = response.data.count / 3;
        $rootScope.customers = response.data.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })


  };

  var obj = {
    'latitude': "30.708225",
    'longitude': "76.7029445"
  }

  $scope.query = {}
  $scope.queryBy = '$'


  $scope.shoppageChanged = function() {
    $scope.loaderStart = true;
    var passingObj = {
      page: $scope.myobj.currentPage,
      count: 30
    }

    if ($scope.myobj.search) {
      passingObj.search = $scope.myobj.search
    }

    Admin.shopsAll(passingObj)
      .then(function(response) {
        $scope.loaderStart = false;
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
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })

  };

  $scope.Sort = function(val) {
    if ($scope.sort == val) {
      $scope.reverse = !$scope.reverse;
      //return;
    }
    $scope.sort = val;
     $('th i').each(function(){
            // icon reset
            $(this).removeClass().addClass('icon-sort');
        });

    if ($scope.reverse) {
      $('th .' + val + ' i').removeClass().addClass('icon-chevron-up');
    } else {
      $('th .' + val + ' i').removeClass().addClass('icon-chevron-down');
    }
  };



  $scope.updatecustomer = function(customer) {
    $scope.loaderStart = true;
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
        $scope.loaderStart = false;
        toastr.success('Customer is updated Succesfully');
        $rootScope.customers = response.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      });

  };

  $scope.updatebarber = function(barber) {
    $scope.loaderStart = true;
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
        $scope.loaderStart = false;
        toastr.success('Barber is updated Succesfully');
        $rootScope.barbers = response.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      });

  };

  $scope.updateshopowner = function(shop) {
    $scope.loaderStart = true;
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
      .then(function(response) {}).catch(function(result) {
        $scope.loaderStart = false;
        toastr.success('Shop is updated Succesfully');
        $scope.messages = result.data.msg
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  };


  $scope.updateshop = function(shop) {
    $scope.loaderStart = true;
    $scope.shop = shop;
    Admin.updateShopinfo(shop)
      .then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Shop is updated Succesfully');
        $rootScope.shops = response.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      });

  };

  $scope.markchairasbooked = function(chair) {
    $scope.loaderStart = true;
    $scope.chair = chair;
    Admin.markChairBooked(chair, $stateParams.id)
      .then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Chair is booked Succesfully');
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  };

  $scope.postchairtoallbarbers = function(chair) {
    $scope.loaderStart = true;
    $scope.chair = chair;
    Admin.postChair(chair, $stateParams.id)
      .then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Chair successfully posted to all barbers');
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  };

  $scope.deleteconfirmchair = function(chair, shop) {
    $scope.chairdel = chair;
    $scope.chairshopdel = shop;
  };

  $scope.deletechair = function() {
    $scope.loaderStart = true;
    var objec = {
      chair_id: $scope.chairdel._id,
      shop_id: $scope.chairshopdel,
      loggedInUser: $stateParams.id
    }
    Admin.deleteChair(objec)
      .then(function(response) {
        $scope.loaderStart = false;
        $rootScope.message = response.data.msg;
        toastr.success('Chair Succesfully Deleted');
        history.go(0);
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
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
    $scope.loaderStart = true;
    Admin.chairDetail($stateParams.id)
      .then(function(response) {
        $scope.loaderStart = false;
        $rootScope.chairdet = response.data.data[0].chairs[0];
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  };

  $scope.shopdetail = function() {
    $scope.loaderStart = true;
    setTimeout(function() {
      Admin.shopDetail($stateParams.id)
        .then(function(response) {
          console.log(response)
          $scope.loaderStart = false;
          $rootScope.shopdetailview = response.data.data[0];
          $rootScope.chairdetails = response.data.data[0].shopinfo[0].chairs;
          console.log(response.data.data[0].shopinfo[0].chairs)
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
        }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }, 1000);

  };


  $scope.addchair = function(chair) {
    $scope.loaderStart = true;
    Admin.addChair(chair)
      .then(function(response) {
       $scope.shopdetail();
       toastr.success('Chair added Succesfully')
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
        console.log(result)
      })
  };


  $scope.updatechair = function(chair, id) {
    $scope.loaderStart = true;
    Admin.updateChair(chair, id)
      .then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Chair updated Succesfully');
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
        console.log(result)
      })
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
    $scope.loaderStart = true;
    setTimeout(function() {
      Admin.barberDetail($stateParams.id)
        .then(function(response) {
          console.log(response)
           $scope.loaderStart = false;
          $rootScope.barberdetail = response.data.data[0];
        }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }, 500);
   
  };

  $scope.cancelappoint = function()
  {
    $scope.loaderStart = true;
    Admin.cancelAppoint($rootScope.appointment)
    .then(function(response) { 
      $scope.loaderStart = false;
        history.go(0);
        toastr.success('Appointment is Canceled');
    }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
  }

  $scope.customerdetails = function() {
    $scope.loaderStart = true;
    setTimeout(function() {
      Admin.custDetail($stateParams.id)
        .then(function(response) {
          $scope.loaderStart = false;
          $rootScope.customerdetail = response.data.data[0];
        }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }, 500);
    

  };

}]);