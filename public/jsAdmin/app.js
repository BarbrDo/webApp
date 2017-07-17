    "use strict";

    var app_admin = angular.module('barbrdo', ['ui.router', 'ui.bootstrap', 'angularModalService', 'rzModule', "chart.js", 'alexjoffroy.angular-loaders', 'ngMask', 'toastr', 'ngStorage']);

    app_admin.config(['$locationProvider', function($locationProvider) {
        $locationProvider.hashPrefix('');
    }]);

    app_admin.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
        // Dashboard
            .state('login', {
                // resolve: {
                //     mess: function($localStorage) {
                //         console.log("heree",$localStorage.loggedIn);
                //         if ($localStorage.loggedIn) {
                //             $state.go('dashboard');
                //         }
                //     }
                // },
                url: '/login',
                controller: "AdminCtrl",
                templateUrl: 'templatesAdmin/loginAdmin.html'
            })
            .state('dashboard', {
                resolve: {
                    mess: function($localStorage) {
                        console.log("here",$localStorage.loggedIn);
                        if ($localStorage.loggedIn != 'true') {
                            $state.go('login');
                        }
                    }
                },
                url: '/dashboard',
                controller: "AdminCtrl",
                templateUrl: 'templatesAdmin/dashboard.html'
            })

        .state('cust_appointments', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/appointments',
            controller: "AdminCtrl",
            templateUrl: '/modalsAdmin/adminHTml/views/appointments.html'
        })

        .state('assoc', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/assoc',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/assoc.html"

        })

        .state('barber-appointments', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/barber/appointments/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/barber-appointments.html"

        })

        .state('edit_barbers', {
                resolve: {
                    mess: function($localStorage) {
                        if ($localStorage.loggedIn != 'true') {
                            $state.go('login');
                        }
                    }
                },
                url: '/barbers/edit/:id',
                controller: "AdminCtrl",
                templateUrl: "/modalsAdmin/adminHTml/views/barber-edit.html"

            })
            .state('detailed_appointment', {
                resolve: {
                    mess: function($localStorage) {
                        if ($localStorage.loggedIn != 'true') {
                            $state.go('login');
                        }
                    }
                },
                url: '/appointment/detail',
                controller: "AdminCtrl",
                templateUrl: "/modalsAdmin/adminHTml/views/appointment-details.html"

            })

        .state('barbers', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/barbers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/barberAdmin.html"
        })

        .state('view_cust_appointment', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/customer/appointment/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/customer-appointments.html"
        })


        .state('editshop', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/shop/edit/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/shop-edit.html"
                // resolve: {
                //      checklogin: login
                //  }
        })

        .state('editcust', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/customer/edit/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/customer-edit.html"
                // resolve: {
                //      checklogin: login
                //  }
        })

        .state('editchair', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/chair/edit/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/chair-edit.html"
                // resolve: {
                //      checklogin: login
                //  }
        })

        .state('shops', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/shops',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/shopAdmin.html"
                // resolve: {
                //      checklogin: login
                //  }
        })

        .state('chairs', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/chairs/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/chairs-details.html"
        })

        .state('barbdetail', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/shop/barbdetail/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/shopsHaving-barbers.html"
                // resolve: {
                //      checklogin: login
                //  }
        })

        .state('customer_detail', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/customer/details/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/customer-details.html"
                // resolve: {
                //      checklogin: login
                //  }
        })

        .state('barbersdetail', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/barberDetail/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/barber-details.html"
                // resolve: {
                //      checklogin: login
                //  }
        })

        .state('customers', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/customers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/customerAdmin.html"

        })

        .state('add_barbers', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/add_barbers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/barber-add.html"

        })

        .state('add_shops', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/add_shops',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/shop-add.html"

        })

        .state('add_customers', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/add_customers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/customer-add.html"

        })

        .state('shopdetail', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/shops/details/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/shop-details.html"

        })

        .state('plans', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/plans',
            controller: "planCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/stripe_plans.html"
        })

        .state('payments', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/payments',
            controller: "paymentCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/stripe_payment.html"
        })

        .state('reports', {
            resolve: {
                mess: function($localStorage) {
                    if ($localStorage.loggedIn != 'true') {
                        $state.go('login');
                    }
                }
            },
            url: '/report',
            controller: "reportCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/reports.html"
        })

    });

    app_admin.config(function(ChartJsProvider) {
        ChartJsProvider.setOptions({
            colors: ['#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
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

    

