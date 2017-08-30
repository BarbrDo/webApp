"use strict";

var app_admin = angular.module('barbrdo', [
  'ui.router',
  'ui.bootstrap',
  'uiSwitch',
  'angularModalService',
  'rzModule',
  "chart.js",
  'alexjoffroy.angular-loaders',
  'ngMask',
  'toastr',
  'ngStorage',
  'angularjs-dropdown-multiselect',
  'ngLodash'
]);

app_admin.config([
  '$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('');
  }
]);

app_admin.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');
  $stateProvider
  // Dashboard
    .state('login', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('dashboard');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/login',
    controller: "AdminCtrl",
    templateUrl: 'templatesAdmin/loginAdmin.html'
  }).state('dashboard', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/dashboard',
    controller: "AdminCtrl",
    templateUrl: 'templatesAdmin/dashboard.html'
  }).state('cust_appointments', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/appointments',
    controller: "AdminCtrl",
    templateUrl: '/modalsAdmin/adminHTml/views/appointments.html'
  }).state('assoc', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/assoc',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/assoc.html"

  }).state('barber-appointments', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/barber/appointments/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/barber-appointments.html"

  }).state('edit_barbers', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/barbers/edit/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/barber-edit.html"

  }).state('detailed_appointment', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/appointment/detail',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/appointment-details.html"

  }).state('barbers', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/barbers',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/barberAdmin.html"
  }).state('plans', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/plans',
    controller: "referCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/plans.html"
  }).state('edit_plan', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/editplan/:id',
    controller: "referCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/add_new_plan.html"
  }).state('add_plans', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/addPlan',
    controller: "referCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/add_new_plan.html"
  }).state('view_cust_appointment', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/customer/appointment/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/customer-appointments.html"
  }).state('editshop', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/shop/edit/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/shop-edit.html"
  }).state('editcust', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/customer/edit/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/customer-edit.html"
    // resolve: {
    //      checklogin: login
    //  }
  }).state('editchair', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/chair/edit/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/chair-edit.html"
  }).state('shops', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/shops',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/shopAdmin.html"
    // resolve: {
    //      checklogin: login
    //  }
  }).state('shop_invites', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/invites',
    controller: "referCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/shop_invites.html"
    // resolve: {
    //      checklogin: login
    //  }
  }).state('chairs', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/chairs/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/chairs-details.html"
  }).state('barbdetail', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/shop/barbdetail/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/shopsHaving-barbers.html"
  }).state('customer_detail', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/customer/details/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/customer-details.html"
    // resolve: {
    //      checklogin: login
    //  }
  }).state('barbersdetail', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/barberDetail/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/barber-details.html"
  }).state('customers', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/customers',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/customerAdmin.html"

  }).state('add_barbers', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/add_barbers',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/barber-add.html"

  }).state('add_shops', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/add_shops',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/shop-add.html"
  }).state('add_invited_shop', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/add/:_id',
    controller: "referCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/shop-add.html"
  }).state('add_customers', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/add_customers',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/customer-add.html"

  }).state('shopdetail', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/shops/details/:id',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/shop-details.html"

  }).state('payments', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/payments',
    controller: "paymentCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/stripe_payment.html"
  }).state('refer', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/refer',
    controller: "referCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/refer.html"
  }).state('refer_detail', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/refer/user/:_id',
    controller: "referCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/refer_detail.html"
  }).state('reports', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },
    url: '/report',
    controller: "reportCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/reports.html"
  }).state('add_services', {
    resolve: {
      mess: function($localStorage, $q, $state) {
        var deferred = $q.defer();
        if ($localStorage.loggedIn != true) {
          setTimeout(function() {
            deferred.resolve()
            $state.go('login');
          }, 0);
          return deferred.promise;
        }
      }
    },

    url: '/add_services',
    controller: "AdminCtrl",
    templateUrl: "/modalsAdmin/adminHTml/views/add_services.html"
  })

});

app_admin.config(function(ChartJsProvider) {
  ChartJsProvider.setOptions({
    colors: [
      '#803690',
      '#00ADF9',
      '#DCDCDC',
      '#46BFBD',
      '#FDB45C',
      '#949FB1',
      '#4D5360'
    ]
  });
});

/* custom directive*/

app_admin.directive('dropMenus', function() {
  return {

    link: function(scope, element) {

      element.bind('click', function(e) {
        scope.findParent = element.parent();
        var parentVal = angular.element(scope.findParent);

        if ($(parentVal).hasClass('dropdown')) {
          scope.sibiling = element.next();
          var targetval = angular.element(scope.sibiling);
          targetval.slideToggle();
          parentVal.toggleClass('dropdownopen');
        }

      });
    }
  }

});

/* stick on scroll */

app_admin.directive('setClassWhenAtTop', function($window) {
  var $win = angular.element($window); // wrap window object as jQuery object

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
        offsetTop = element.offset().top; // get element's top relative to the document

      $win.on('scroll', function(e) {
        if ($win.scrollTop() >= offsetTop) {
          element.addClass(topClass);
        } else {
          element.removeClass(topClass);
        }
      });
    }
  };
})
app_admin.directive('googleplace', function() {
    var componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            locality: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'long_name',
            postal_code: 'short_name'
        };
        var mapping = {
            street_number: 'number',
            route: 'street',
            locality: 'city',
            administrative_area_level_1: 'state',
            country: 'country',
            postal_code: 'zip'
        };
        // https://gist.github.com/VictorBjelkholm/6687484 
        // modified to have better structure for details
        return {
            require: 'ngModel',
            scope: {
                ngModel: '=',
                details: '=?'
            },
            link: function (scope, element, attrs, model) {
               var options = {
                types: [],
                componentRestrictions: {}
            };

                scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

                google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                    var place = scope.gPlace.getPlace();
                    var details = place.geometry && place.geometry.location ? {
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng()
                    } : {};
                    // Get each component of the address from the place details
                    // and fill the corresponding field on the form.
                    for (var i = 0; i < place.address_components.length; i++) {
                        var addressType = place.address_components[i].types[0];
                        if (componentForm[addressType]) {
                            var val = place.address_components[i][componentForm[addressType]];
                            details[mapping[addressType]] = val;
                        }
                    }
                    details.formatted = place.formatted_address;
                    details.placeId = place.place_id;
                    console.log(details);
                    scope.$apply(function () {
                        scope.user = details; // array containing each location component
                        scope.shop_address_user = {
                          address:details.formatted,
                          city:details.city,
                          state:details.state,
                          zip:details.zip,
                          country:details.country,
                          street:details.street
                        }
                        console.log(element.val());
                        model.$setViewValue(details);
                    });
                });
            }
        };
});

