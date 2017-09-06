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
  'ngTableParams',
  function($scope, $rootScope, $location, Admin, $filter, $log, $stateParams, $state, toastr, $localStorage, ngTableParams, $uibModal) {
    $scope.loginUser = {};
    $scope.user = {};
    $scope.myobj = {};
    $scope.myobj.currentPage = 1;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    $scope.fieldDisabled = false;
    if ($localStorage.loggedIn == true) {
      $rootScope.LoginUser = true;
      $rootScope.loggedInUserDetail = $localStorage.loginInfo;
      if ($rootScope.loggedInUserDetail) {
        $rootScope.imageDisplay = $localStorage.imgPath + $localStorage.loginInfo.picture
      } else {
        $rootScope.imageDisplay = "http://www.psdgraphics.com/file/user-icon.jpg"
      }

      console.log($rootScope.imageDisplay);
    } else {
      $rootScope.LoginUser = false;
    }

    $scope.toggleleftclass = false;

    $scope.togglebodyclass = function() {
      $scope.toggleleftclass = !$scope.toggleleftclass;

    }

    $scope.getGraph = function(){
      Admin.getGraph().then(function(response){
        $scope.labels = [
          "Jan", "Feb", "March", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        $scope.series = ['Customers','Barbers','Shops'];
        $scope.data = [response.data.customer,response.data.barber,response.data.shop];
      })
    }

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
        console.log(response.data)
        $localStorage.loginInfo = response.data.user
        $localStorage.imgPath = response.data.imagesPath;
        $localStorage.loggedIn = true;
        $state.go('dashboard')
      }).catch(function(result) {
        toastr.error('you are not Authorized');
      })
    }
    $scope.logout = function() {
      $localStorage.loggedIn = false;
      $localStorage.loginInfo = {};
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
    // $rootScope.applyFilter = "";
    $scope.filterAppointment = function(data){
      $rootScope.applyFilter = data;
      $scope.custAppoint();
    }

    $scope.custAppoint = function() {
      Admin.appointmentcount().then(function(response) {
        $rootScope.totalappointment = response.data.data;
      });

      $scope.loaderStart = true;
      var passingObj = {}
      passingObj.applyFilter = $rootScope.applyFilter;
      passingObj.search = $scope.appointmentObj.search;
      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          appointment_date: "desc"
        }
      }, {
        counts: [],
        getData: function($defer, params) {
          passingObj.page = params.page();
          passingObj.count = params.count();
          passingObj.sort = params.sorting();
          $scope.loaderStart = true;
          Admin.appointments(passingObj).then(function(response) {
            $scope.loaderStart = false;
            params.total(response.data.count);
            $scope.data = response.data.data;
            $defer.resolve($scope.data);
          }).catch(function(result) {
            $scope.loaderStart = false;
            $scope.messages = result.data.msg
          })
        }
      })
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
    if ($state.current.name == 'detailed_appointment') {
      $scope.loaderStart = true;
      let obj = {
        _id: $stateParams._id
      }
      Admin.currentAppointmentData(obj).then(function(response) {
        $scope.loaderStart = false;
        $scope.viewappoint = response.data.data;
      })
    }
    $scope.appointdetail = function(appointment) {
      $rootScope.viewappoint = appointment
    };

    $scope.query = {}
    $scope.queryBy = '$'

    $scope.custpageChanged = function() {
      $scope.loaderStart = true;
      var passingObj = {}
      passingObj.search = $scope.myobj.search
      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          created_date: "desc"
        }
      }, {
        counts: [],
        getData: function($defer, params) {
          passingObj.page = params.page();
          passingObj.count = params.count();
          passingObj.sort = params.sorting();
          $scope.loaderStart = true;
          Admin.customersAll(passingObj).then(function(response) {
            $scope.loaderStart = false;
            params.total(response.data.count);
            $scope.data = response.data.data;
            $defer.resolve($scope.data);
          }).catch(function(result) {
            $scope.loaderStart = false;
            $scope.messages = result.data.msg
          })
        }
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
      var passingObj = {}
      passingObj.search = $scope.myobj.search
      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          created_date: "desc"
        }
      }, {
        counts: [],
        getData: function($defer, params) {
          passingObj.page = params.page();
          passingObj.count = params.count();
          passingObj.sort = params.sorting();
          $scope.loaderStart = true;
          Admin.shopsAll(passingObj).then(function(response) {
            $scope.loaderStart = false;
            params.total(response.data.count);
            $scope.data = response.data.data;
            $defer.resolve($scope.data);
          }).catch(function(result) {
            $scope.loaderStart = false;
            $scope.messages = result.data.msg
          })
        }
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
      if (customer.is_active == "true" || customer.is_active == true) {
        customer.is_active = true;
      } else {
        customer.is_active = false;
      }
      if (customer.is_deleted == "true" || customer.is_deleted == true) {
        customer.is_deleted = true
      } else {
        customer.is_deleted = false
      }
      if (customer.is_verified == "true" || customer.is_verified == true) {
        customer.is_verified = true
      } else {
        customer.is_verified = false
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

    $scope.updatebarberinformation = function(barber) {
      $scope.loaderStart = true;
      console.log(barber);
      if (barber.is_active == "true" || barber.is_active == true) {
        barber.is_active = true;
      } else {
        barber.is_active = false;
      }
      if (barber.is_deleted == "true" || barber.is_deleted == true) {
        barber.is_deleted = true
      } else {
        barber.is_deleted = false
      }
      if (barber.is_verified == "true" || barber.is_verified == true) {
        barber.is_verified = true
      } else {
        barber.is_verified = false
      }
      console.log(barber);
      Admin.updateBarberSubscription(barber).then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Barber is updated Succesfully');
        $rootScope.barbers = response.data;
      }).catch(function(result) {
        $scope.loaderStart = false;
        $scope.messages = result.data.msg
      });
    };


    $scope.updatebarber = function(barber) {
      $scope.loaderStart = true;
      if (barber.is_active == true) {
        barber.is_active = true;
      } else {
        barber.is_active = false;
      }
      if (barber.is_deleted == "true") {
        barber.is_deleted = true
      } else {
        barber.is_deleted = false
      }
      if (barber.is_verified == "true") {
        barber.is_verified = true
      } else {
        barber.is_verified = false
      }
      if (barber.is_online == "true") {
        barber.is_online = true
      } else {
        barber.is_online = false
      }
      if (barber.is_available == "true") {
        barber.is_available = true
      } else {
        barber.is_available = false
      }
      console.log(barber);
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

    $scope.updateshop = function() {
      $scope.loaderStart = true;
      console.log($scope.user);
      console.log($scope.detail);
      console.log($scope.detail.formatted);
      console.log(typeof($scope.detail.formatted));
      let passObj = $scope.user;
      if (typeof($scope.detail.formatted) == 'string') {
        console.log("inside string");
        passObj.formatted_address = $scope.detail.formatted;
        passObj.address = $scope.user.street_address;
        passObj.latitude = $scope.user.latitude;
        passObj.longitude = $scope.user.longitude;
      } else {
        passObj.formatted_address = $scope.detail.formatted.formatted;
        passObj.address = $scope.user.street_address;
        passObj.latitude = $scope.user.latitude;
        passObj.longitude = $scope.user.longitude;
      }
      console.log(passObj)
      Admin.updateShopinfo(passObj).then(function(response) {
        $scope.loaderStart = false;
        toastr.success('Shop is updated Succesfully');
        $state.go('shops')
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
    $scope.updateShopButton = true;
    if ($state.current.name == 'edit_shops') {
      $scope.updateShopButton = false;
      $scope.loaderStart = true;
      Admin.shopDetail($stateParams._id).then(function(response) {
        $scope.user = response.data.data;
        $scope.detail = {
          formatted: response.data.data.formatted_address
        }
        $scope.user.street_address = response.data.data.address
        $scope.user.latitude = response.data.data.latLong[1];
        $scope.user.longitude = response.data.data.latLong[0];

        $scope.loaderStart = false;
      }).catch(function(result) {
        toastr.error("Error");
        console.log(result);
        $scope.loaderStart = false;
      })
    }
    // $scope.shopdetail = function() {
    //   $scope.loaderStart = true;
    //   setTimeout(function() {
    //     Admin.shopDetail($stateParams.id).then(function(response) {
    //       console.log(response)
    //       $scope.loaderStart = false;
    //       $rootScope.shopdetailview = response.data.data[0];
    //       $rootScope.chairdetails = response.data.data[0].shopinfo[0].chairs;
    //       console.log(response.data.data[0].shopinfo[0].chairs)
    //       var shopsdet = [];
    //       var object = {};
    //       var len = response.data.data.length;
    //       for (var i = 0; i < len; i++) {
    //         var k = 0;
    //         for (var j = 0; j < response.data.data[i].shopinfo[0].chairs.length; j++) {
    //           if (response.data.data[i].shopinfo[0].chairs[j].barber_id) {
    //             k++;
    //           }
    //         }

    //         var object = {
    //           totalBarbers: k
    //         };

    //         shopsdet.push(object);
    //         $rootScope.totalbarbers = object;
    //       }
    //     }).catch(function(result) {
    //       $scope.loaderStart = false;
    //     })
    //   }, 1000);

    // };

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
      $scope.getGraph();
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
        console.log("count", response);
        $rootScope.totalbarber = response.data.total;
        $scope.onlineBarber = response.data.online;
        $scope.offlineBarber = response.data.offline;
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
        $scope.numberOfCuts = response.data.cuts;
        $scope.ratings = response.data.ratings;
        $scope.barberdetail.created_date = response.data.data[0].created_date;
        console.log(response.data.data[0]);
        $scope.barberdetail.endDate = new Date(response.data.data[0].subscription_end_date);
        $scope.showShops = [];
        var passingObj = {}
        passingObj.search = $scope.myobj.search
        $scope.tableParams = new ngTableParams({
          page: 1,
          count: 10,
          sorting: {
            name: "desc"
          }
        }, {
          counts: [],
          getData: function($defer, params) {
            passingObj.page = params.page();
            passingObj.count = params.count();
            passingObj.sort = params.sorting();
            $scope.loaderStart = true;
            Admin.getAllShops(passingObj).then(function(response) {
              console.log("all shops", response.data.data);
              for (var i = 0; i < $scope.barberdetail.associateShops.length; i++) {
                for (var j = 0; j < response.data.data.length; j++) {
                  // console.log(response.data.data[j].id, $scope.barberdetail.associateShops[i]._id)
                  // console.log(response.data.data[j].id == $scope.barberdetail.associateShops[i]._id)
                  if (response.data.data[j]._id == $scope.barberdetail.associateShops[i]._id) {
                    response.data.data.splice(j, 1)
                  }
                }
              }
              $scope.data = response.data.data;
              console.log("========++++++++++========",response.data.data)
              $scope.loaderStart = false;
            })
          }
        })

      }).catch(function(result) {
        $scope.loaderStart = false;
        console.log("issue is", result);
        $scope.messages = result
      })
    }

    $scope.pageChanged = function(argument) {
      $scope.loaderStart = true;
      var passingObj = {}
      passingObj.search = $scope.myobj.search;
      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
          created_date: "desc"
        }
      }, {
        counts: [],
        getData: function($defer, params) {
          console.log("params url", params.url());
          console.log("params sorting", params.sorting());
          console.log("paramspage", params.page());
          passingObj.page = params.page();
          passingObj.count = params.count();
          passingObj.sort = params.sorting();
          $scope.loaderStart = true;
          Admin.barbers(passingObj).then(function(response) {
            $scope.loaderStart = false;
            params.total(response.data.count);
            $scope.data = response.data.data;
            $defer.resolve($scope.data);
          }).catch(function(result) {
            $scope.loaderStart = false;
            $scope.messages = result.data.msg
          })
        }
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
      for (var i = 0; i < $scope.price.length; i++) {
        if ($scope.price[i] != undefined) {
          let obj = {
            service_id: $scope.allservices[i]._id,
            name: $scope.allservices[i].name,
            price: $scope.price[i]
          }
          services.push(obj)
        }
      }
      var obj = {
        shop_id: $scope.shopIds,
        barber_id: $rootScope.barber_id
      }
      Admin.goOnline(obj, services).then(function(response) {
        $scope.pageChanged();
      })
    }
    $scope.shopIds = {}
    $scope.getUserId = function(userId) {
      $scope.shopIds = userId
    }
    $scope.getBarberId = function(barber_id) {
      $rootScope.barber_obj_id = barber_id
    }
    $scope.goOffline = function() {
      var obj = {
        barber_id: $rootScope.barber_obj_id
      }
      Admin.goOffline(obj).then(function(response) {
        $scope.pageChanged();
      }).catch(function(response) {
        alert(response);
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
    $scope.saveShop = function() {
      console.log($scope.user);
      console.log($scope.detail.formatted);

      let passObj = $scope.user;
      passObj.formatted_address = $scope.detail.formatted.formatted;
      passObj.address = $scope.user.street_address;
      passObj.latitude = $scope.user.latitude;
      passObj.longitude = $scope.user.longitude;
      console.log(passObj)
      Admin.saveShopInfo(passObj).then(function(response) {
        toastr.success("Shop added successfully.")
        $state.go('shops')
      }).catch(function(response) {
        toastr.error("Error in adding shop");
      })
    }
  }
]);