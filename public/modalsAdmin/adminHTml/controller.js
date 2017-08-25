app_admin.controller("AdminCtrl", [
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
    $scope.loginUser = {};
    $scope.user = {};
    $scope.myobj = {};
    $scope.myobj.currentPage = 1;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    $scope.fieldDisabled = false;
    if ($localStorage.loggedIn == true) {
      $rootScope.LoginUser = true;
    } else {
      $rootScope.LoginUser = false;
    }

    $scope.toggleleftclass = false;

    $scope.togglebodyclass = function() {
      $scope.toggleleftclass = !$scope.toggleleftclass;

    }
    $scope.labels = [
      "2010",
      "2011",
      "2012",
      "2013",
      "2014",
      "2017",
      "2016"
    ];
    $scope.series = ['Barbers', 'Shops', 'Customers'];
    $scope.data = [
      [
        5,
        15,
        20,
        25,
        30,
        45,
        50
      ],
      [
        10,
        20,
        30,
        40,
        50,
        60,
        70
      ],
      [
        30,
        60,
        90,
        120,
        150,
        180,
        210
      ]
    ];

    $scope.datasetOverride = [{
      yAxisID: 'y-axis-1'
    }, {
      yAxisID: 'y-axis-2'
    }];
    $scope.options = {
      scales: {
        yAxes: [{
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        }, {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }]
      }
    };

    // Disable weekend selection
    function disabled(data) {
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.loginAdmin = function() {
      Admin.login($scope.loginUser).then(function(response) {
        toastr.success('Welcome Admin');
        $localStorage.loggedIn = true;
        $state.go('dashboard')
      }).catch(function(result) {
        toastr.error('you are not Authorized');
      })
    }
    $scope.logout = function() {
      $localStorage.loggedIn = false;
      $state.go('login');
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

    $scope.appointmentObj = {};
    $scope.appointmentObj.currentPage = 1;
    $scope.custAppoint = function() {
      $scope.loaderStart = true;
      var passingObj = {
        page: $scope.appointmentObj.currentPage,
        count: 10
      }
      if ($scope.appointmentObj.search) {
        passingObj.search = $scope.appointmentObj.search
      }
      console.log(passingObj)
      Admin.appointments(passingObj)
        .then(function(response) {
          $scope.allAppointments = response.data.data;
          $scope.appointmentObj.totalItems = response.data.count;
          console.log("response.data.count",response.data.count);
          $scope.loaderStart = false;
        });

    };

    $scope.viewappointment = function() {
      $scope.loaderStart = true;
      Admin.custAppoints($stateParams.id).then(function(response) {
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
      Admin.barberAppoints($stateParams.id).then(function(response) {
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
      Admin.confirmAppoint($rootScope.appointment).then(function(response) {
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
      Admin.markComplete($rootScope.appointment, $stateParams.id).then(function(response) {
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
      Admin.rescheduleAppoint($rootScope.appointment, $rootScope.time).then(function(response) {
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
      console.log($scope.user)
      Admin.addCustomer($scope.user).then(function(response) {
        $scope.loaderStart = false;
        $state.go(params);
        toastr.success(params + '' +
          'is Added Successfully');
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
        count: 10
      }
      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }
      Admin.customersAll(passingObj).then(function(response) {
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
        count: 10
      }

      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }

      Admin.shopsAll(passingObj).then(function(response) {
        $scope.loaderStart = false;
        $scope.shops = response.data.data;
        $scope.myobj.totalItems = response.data.count;
      }).catch(function(result) {
        $scope.loaderStart = false;
        console.log(result);
      })

    };

    $scope.Sort = function(val) {
      if ($scope.sort == val) {
        $scope.reverse = !$scope.reverse;
        //return;
      }
      $scope.sort = val;
      $('th i').each(function() {
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
      if(customer.is_active==true){
        customer.is_active = true;
      }
      else{
        customer.is_active = false;
      }
      if(customer.is_deleted=="true"){
        customer.is_deleted=true
      }
      else{
        customer.is_deleted=false
      }
      if(customer.is_verified=="true"){
        customer.is_verified=true
      }
      else{
        customer.is_verified=false
      }
      Admin.updateCustomer(customer).then(function(response) {
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
      if(barber.is_active==true){
        barber.is_active = true;
      }
      else{
        barber.is_active = false;
      }
      if(barber.is_deleted=="true"){
        barber.is_deleted=true
      }
      else{
        barber.is_deleted=false
      }
      if(barber.is_verified=="true"){
        barber.is_verified=true
      }
      else{
        barber.is_verified=false
      }
      if(barber.is_online=="true"){
        barber.is_online=true
      }
      else{
        barber.is_online=false
      }
      if(barber.is_available=="true"){
        barber.is_available=true
      }
      else{
        barber.is_available=false
      }
      Admin.updateBarber(barber).then(function(response) {
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
      Admin.updateShop(shop).then(function(response) {}).catch(function(result) {
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
      Admin.updateShopinfo(shop).then(function(response) {
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
      Admin.markChairBooked(chair, $stateParams.id).then(function(response) {
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
      Admin.postChair(chair, $stateParams.id).then(function(response) {
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
      Admin.deleteChair(objec).then(function(response) {
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
      Admin.deleteBarber($scope.barber).then(function(response) {
        $rootScope.barbers = response.data;
      });

    };
    $scope.undeletebarber = function(barber) {
      Admin.undeleteBarber($scope.barber).then(function(response) {
        $rootScope.barbers = response.data;
      });

    };

    $scope.deleteshop = function(shop) {
      $scope.shop = shop;
      Admin.deleteShop(shop).then(function(response) {
        $rootScope.shops = response.data;
      });

    };

    $scope.undeleteshop = function(shop) {
      $scope.shop = shop;
      Admin.undeleteShop(shop).then(function(response) {
        $rootScope.shops = response.data;
      });

    };

    $scope.deletecustomer = function(customer) {
      $scope.customer = customer;
      Admin.deleteCustomer($scope.customer).then(function(response) {
        $rootScope.customers = response.data;
      });
    };

    $scope.undeletecustomer = function(customer) {
      $scope.customer = customer;
      Admin.undeleteCustomer($scope.customer).then(function(response) {
        $rootScope.customers = response.data;
      });
    };

    $scope.deactivecust = function(customer) {
      $scope.customer = customer;
      Admin.deactiveCustomer(customer).then(function(response) {
        $rootScope.deactivecustomers = response.data;
      });

    };

    $scope.activatecust = function(customer) {
      $scope.customer = customer;
      Admin.activateCustomer(customer).then(function(response) {
        $rootScope.deactivecustomers = response.data;
      });

    };

    $scope.disapprovecust = function(customer) {
      $scope.customer = customer;
      Admin.disapproveCustomer(customer).then(function(response) {
        $rootScope.deactivecustomers = response.data;
      });

    };

    $scope.verifycust = function(customer) {
      $scope.customer = customer;
      Admin.verifyCustomer(customer).then(function(response) {
        $rootScope.deactivecustomers = response.data;
      });

    };

    $scope.deactiveshop = function(shop) {
      $scope.shop = shop;
      Admin.deactiveShop(shop).then(function(response) {
        $rootScope.deactiveshops = response.data;
      });

    };

    $scope.activateshop = function(shop) {
      $scope.shop = shop;
      Admin.activateShop(shop).then(function(response) {
        $rootScope.deactiveshops = response.data;
      });

    };

    $scope.disapproveshop = function(shop) {
      $scope.shop = shop;
      Admin.disapproveShop(shop).then(function(response) {
        $rootScope.deactiveshops = response.data;
      });

    };

    $scope.verifyshop = function(shop) {
      $scope.shop = shop;
      Admin.verifyShop(shop).then(function(response) {
        $rootScope.deactiveshops = response.data;
      });

    };

    $scope.deactivatebarber = function(barber) {
      $scope.barber = barber;
      Admin.deactiveBarber(barber).then(function(response) {
        $rootScope.deactivebarbers = response.data;
      });
    };

    $scope.disapprovebarber = function(barber) {
      $scope.barber = barber;
      Admin.disapproveBarber(barber).then(function(response) {
        $rootScope.deactivebarbers = response.data;
      });
    };

    $scope.verifybarber = function(barber) {
      $scope.barber = barber;
      Admin.verifyBarber(barber).then(function(response) {
        $rootScope.deactivebarbers = response.data;
      });
    };

    $scope.activatebarber = function(barber) {
      $scope.barber = barber;
      Admin.activateBarber(barber).then(function(response) {
        $rootScope.deactivebarbers = response.data;
      });
    };

    $scope.chairdetail = function() {
      $scope.loaderStart = true;
      Admin.chairDetail($stateParams.id).then(function(response) {
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
        Admin.shopDetail($stateParams.id).then(function(response) {
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
        })
      }, 1000);

    };

    $scope.addchair = function(chair) {
      $scope.loaderStart = true;
      Admin.addChair(chair).then(function(response) {
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
      Admin.updateChair(chair, id).then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Chair updated Succesfully');
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
        console.log(result)
      })
    };

    $scope.countall = function() {
      Admin.countAppointment().then(function(response) {
        $rootScope.totalappointment = response.data.data;
      });

      Admin.countShop().then(function(response) {
        $rootScope.totalshop = response.data;
      });

      Admin.countCustomer().then(function(response) {
        $rootScope.totalcustomer = response.data;
      });

      Admin.countBarber().then(function(response) {
        $rootScope.totalbarber = response.data;
      });
    };

    $scope.cancelappoint = function() {
      $scope.loaderStart = true;
      Admin.cancelAppoint($rootScope.appointment).then(function(response) {
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
        Admin.custDetail($stateParams.id).then(function(response) {
          $scope.loaderStart = false;
          $rootScope.customerdetail = response.data.data[0];
        }).catch(function(result) {
          $scope.loaderStart = false;
          $scope.messages = result.data.msg
        })
      }, 500);

    };

    $scope.services = function() {
      $scope.loaderStart = true;
      Admin.allservices().then(function(response) {
        $scope.loaderStart = false;
        $scope.services = response.data.data
      })
    }

    $scope.addservice = function(name) {
      if (name) {
        $scope.loaderStart = true;
        var obj = {
          name: name
        }
        Admin.addServices(obj).then(function(response) {
          Admin.allservices().then(function(response) {
            $scope.loaderStart = false;
            $scope.services = response.data.data
            toastr.success('Service is Added successfully')
            $scope.service = '';
          })
        })
      } else {
        toastr.error('Name cannot left blank')
      }

    }

    $scope.editservices = function(name, id) {
      if (name) {
        $scope.loaderStart = true;
        var obj = {
          name: name,
          service_id: id
        }
        Admin.editServices(obj).then(function(response) {
          Admin.allservices().then(function(response) {
            $scope.loaderStart = false;
            $scope.services = response.data.data
            toastr.success('Service is Updated successfully')
          })
        })
      } else {
        toastr.error('Name cannot left blank')
        Admin.allservices().then(function(response) {
          $scope.services = response.data.data
        })
      }
    }

    $scope.disableservice = function(id) {
      if (id) {
        $scope.loaderStart = true;
        var obj = {
          service_id: id
        }
        Admin.disableServices(obj).then(function(response) {
          Admin.allservices().then(function(response) {
            $scope.loaderStart = false;
            $scope.services = response.data.data
            toastr.success('This service is disabled successfully')
          })
        })
      } else {
        toastr.error('Error in your request')
      }
    }

    $scope.enableservice = function(id) {

      if (id) {
        $scope.loaderStart = true;
        var obj = {
          service_id: id
        }
        Admin.enableServices(obj).then(function(response) {
          Admin.allservices().then(function(response) {
            $scope.loaderStart = false;
            $scope.services = response.data.data
            toastr.success('This service is enabled successfully')
          })
        })
      } else {
        toastr.error('Error in your request')
      }
    }

    $scope.cancel = function() {
      Admin.allservices().then(function(response) {
        $scope.services = response.data.data
      })
    }

    /*
    ________________________
    18th of aug
    Hussain Mohammed 
    ________________________
    */


    // if ($state.current.name == 'barbersdetail') {
    $scope.barberDetails = function() {
      $scope.searchSelectAllModel = [];
      $scope.searchSelectAllSettings = {
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false
      };
      $scope.loaderStart = true;
      Admin.barberDetail($stateParams.id).then(function(response) {
        $scope.loaderStart = false;
        $scope.barberdetail = response.data.data[0];
        $scope.showShops = [];
        Admin.getAllShops().then(function(response) {
          console.log("all shops", response.data.data);
          for (var i = 0; i < $scope.barberdetail.associateShops.length; i++) {
            for (var j = 0; j < response.data.data.length; j++) {
              // console.log(response.data.data[j].id, $scope.barberdetail.associateShops[i]._id)
              // console.log(response.data.data[j].id == $scope.barberdetail.associateShops[i]._id)
              if (response.data.data[j].id == $scope.barberdetail.associateShops[i]._id) {
                response.data.data.splice(j, 1)
              }
            }
          }
          $scope.showShops = response.data.data;
        })
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }

    $scope.pageChanged = function(argument) {
      console.log("page changed");
      $scope.loaderStart = true;
      var passingObj = {
        page: $scope.myobj.currentPage,
        count: 10
      }
      if ($scope.myobj.search) {
        passingObj.search = $scope.myobj.search
      }
      Admin.barbers(passingObj).then(function(response) {
        $scope.loaderStart = false;
        $scope.myobj.totalItems = response.data.count;
        $rootScope.barbers = response.data.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      })
    }

    $scope.barbrInfo = function(barber_id) {
      console.log("barber info");
       $scope.price = [];
      $scope.shopIds = {}
      Admin.barberServices().then(function(response) {
        $scope.allservices = response.data.data;
        console.log("barber all services", $scope.allservices)
      })
      $rootScope.barber_id = barber_id;
      Admin.barberDetail(barber_id).then(function(response) {
        // $scope.loaderStart = false;
        $scope.barberInfo = response.data.data[0];
        console.log("barberInfo", $scope.barberInfo)
      })
    }

    $scope.addAssociateShop = function(shop_id) {
      $scope.loaderStart = true;
      let arr = [];
      let obj = {
        shop_id: shop_id
      }
      arr.push(obj);
      let passobj = {
        shops: arr,
        user_id: $stateParams.id
      }
      Admin.addShopsWithbarber(passobj).then(function(response) {
        // console.log(response);
        $scope.barberDetails()
      })
    }
    $scope.removeShop = function(shop_id) {
      $scope.loaderStart = true;
      let obj = {
        shop_id: shop_id,
        user_id: $stateParams.id
      }
      Admin.removeAssociateShop(obj).then(function(response) {
        // console.log(response);
        $scope.barberDetails()
      })
    }
    $scope.addDefaultShop = function(shop_id) {
      $scope.loaderStart = true;
      let obj = {
        shop_id: shop_id,
        user_id: $stateParams.id
      }
      Admin.makeDefaultShop(obj).then(function(response) {
        // console.log(response);
        $scope.barberDetails()
      })
    }
    // $scope.goOnline = function(shop_id) {
    //   console.log(shop_id)
    //   $scope.loaderStart = true;
    //   let obj = {
    //     shop_id: shop_id,
    //     user_id: $rootScope.barber_id
    //   }
    //   Admin.goOnline(obj).then(function(response) {
    //     // console.log(response);
    //     $scope.barberDetails()
    //   })
    // }
    $scope.price = [];

    $scope.submit = function() {
      console.log("shopid", $scope.shopIds);
      console.log("myservice", $scope.price);
      let services = []
      for(var i=0;i<$scope.price.length;i++){
        if($scope.price[i]!=undefined){
          let obj = {
            service_id:$scope.allservices[i]._id,
            name:$scope.allservices[i].name,
            price:$scope.price[i]
          }
          services.push(obj)
        }
      }
      var obj = {
        shop_id:$scope.shopIds,
        barber_id:$rootScope.barber_id
      }
      Admin.goOnline(obj,services).then(function(response) {
        $scope.pageChanged();
      })
    }
    $scope.shopIds = {}
    $scope.getUserId = function(userId) {
      $scope.shopIds = userId
    }
    $scope.getBarberId = function(barber_id){
     $rootScope.barber_obj_id = barber_id
    }
    $scope.goOffline = function () {
       var obj = {
        barber_id:$rootScope.barber_obj_id
      }
      Admin.goOffline(obj).then(function(response) {
        $scope.pageChanged();
      }).catch(function(response){
        alert(response);
      })
    }
  }
]);