angular.module('BarbrDoApp', ['ui.router', 'satellizer', 'slick', 'oc.lazyLoad', 'ngMask', 'ui.bootstrap', 'ngTable', 'alexjoffroy.angular-loaders', 'uiGmapgoogle-maps', 'rzModule', 'ngFileUpload', 'uiSwitch', 'toastr', 'checklist-model'])
    .config(
        ['uiGmapGoogleMapApiProvider', function(GoogleMapApiProviders) {
            GoogleMapApiProviders.configure({
                china: true
            });
        }])
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $authProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    "home": {
                        templateUrl: 'partials/home.html',
                        controller: 'HeaderCtrl'
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html'
                    },
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: 'HeaderCtrl'
                    }
                }
                /*,
                                resolve: {
                                    skipIfAuthenticated: skipIfAuthenticated
                                }*/
            })

        .state('barberHome', {
                url: '/barber',
                views: {
                    "home": {
                        templateUrl: 'partials/barbersHome.html',
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html'
                    },
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: 'HeaderCtrl'
                    }
                }
            })
            .state('shopHome', {
                url: '/shops',
                views: {
                    "home": {
                        templateUrl: 'partials/barberShopHome.html',
                        controller: 'HeaderCtrl'
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html'
                    },
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: 'HeaderCtrl'
                    }
                }
            })
            // Customer URL's are here
            .state('dashboard', {
                url: '/dashboard',
                views: {
                    "homeDash": {
                        templateUrl: 'partials/dashboard.html',
                        controller: "dashboardCtrl"
                    },
                    "header": {
                        templateUrl: 'partials/headerAfterLogin.html',
                        controller: "HeaderCtrl"
                    },
                    "sideBar": {
                        templateUrl: 'partials/afterLoginSideBar.html'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['js/controllers/dashboard.js',
                                'js/services/customer.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })

        .state('pending', {
            url: '/pending-confirmation/:_id',
            params: {
                _id: null
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/pending_confirmation.html',
                    controller: "dashboardCtrl"
                },
                "header": {
                    templateUrl: 'partials/headerAfterLogin.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/afterLoginSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['/js/controllers/dashboard.js',
                            '/js/services/customer.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }],
                loginRequired: loginRequired
            }
        })

        .state('gallery', {
                url: '/gallery',
                views: {
                    "homeDash": {
                        templateUrl: 'partials/customer_gallery.html',
                        controller: "dashboardCtrl"
                    },
                    "header": {
                        templateUrl: 'partials/headerAfterLogin.html',
                        controller: "HeaderCtrl"
                    },
                    "sideBar": {
                        templateUrl: 'partials/afterLoginSideBar.html'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['/js/controllers/dashboard.js',
                                '/js/services/customer.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }],
                    loginRequired: loginRequired
                }
            })
            .state('shopContainsBarbers', {
                url: '/shopContainsBarbers/:_id',
                params: {
                    _id: null
                },
                views: {
                    "homeDash": {
                        templateUrl: 'partials/shopHavingBarbers.html',
                        controller: "dashboardCtrl"
                    },
                    "header": {
                        templateUrl: 'partials/headerAfterLogin.html',
                        controller: "HeaderCtrl"
                    },
                    "sideBar": {
                        templateUrl: 'partials/afterLoginSideBar.html'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['/js/controllers/dashboard.js',
                                '/js/services/customer.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })

        .state('upcomingComplete', {
            url: '/home',
            views: {
                "homeDash": {
                    templateUrl: 'partials/customer_upcoming_completed.html',
                    controller: "dashboardCtrl"
                },
                "header": {
                    templateUrl: 'partials/headerAfterLogin.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/afterLoginSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/dashboard.js',
                            'js/services/customer.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('bookNow', {
            url: '/book/:shop_id/:barber_id',
            params: {
                shop_id: null,
                barber_id: null
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/book_now.html',
                    controller: "dashboardCtrl"
                },
                "header": {
                    templateUrl: 'partials/headerAfterLogin.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/afterLoginSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['/js/controllers/dashboard.js',
                            '/js/services/customer.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('viewProfile', {
            url: '/profile',
            views: {
                "homeDash": {
                    templateUrl: 'partials/profile.html',
                    controller: "ProfileCtrl"
                },
                "header": {
                    templateUrl: 'partials/headerAfterLogin.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/afterLoginSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['/js/controllers/profile.js',
                            '/js/services/account.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })


        // Barbers from here

        .state('barberDashboard', {
            url: '/dashboardOfBarber',
            views: {
                "homeDash": {
                    templateUrl: 'partials/barberDashboard.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/barberController.js',
                            'js/services/barber.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }],
                loginRequired: loginRequired
            }
        })

        .state('searchchair', {
            url: '/searchchair',
            views: {
                "homeDash": {
                    templateUrl: 'partials/searchchair.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/barberController.js',
                            'js/services/barber.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })



        .state('barberGallery', {
            url: '/barberGallery',
            views: {
                "homeDash": {
                    templateUrl: 'partials/customer_gallery.html',
                    controller: "dashboardCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['/js/controllers/dashboard.js',
                            '/js/services/customer.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }],
                loginRequired: loginRequired
            }
        })


        .state('manageservices', {
                url: '/manageservices',
                views: {
                    "homeDash": {
                        templateUrl: 'partials/manageservices.html',
                        controller: "barberCtrl"
                    },
                    "header": {
                        templateUrl: 'partials/barber_header_manage_services.html',
                        controller: "HeaderCtrl"
                    },
                    "sideBar": {
                        templateUrl: 'partials/barberSideBar.html'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['js/controllers/barberController.js',
                                'js/services/barber.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })
            .state('addservice', {
                url: '/addservice',
                views: {
                    "homeDash": {
                        templateUrl: 'partials/addservice.html',
                        controller: "barberCtrl"
                    },
                    "header": {
                        templateUrl: 'partials/barber_header_manage_services.html',
                        controller: "HeaderCtrl"
                    },
                    "sideBar": {
                        templateUrl: 'partials/barberSideBar.html'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['js/controllers/barberController.js',
                                'js/services/barber.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })

        .state('shopChairs', {
            url: '/chairs/:_id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/requestForChair.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/barberController.js',
                            'js/services/barber.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('rescheduleAppointment', {
            url: '/reschedule/:_id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/reschedule_appointment.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/barberController.js',
                            'js/services/barber.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('appointmentDetail', {
            url: '/appointmentdetail/:_id',
            params: {
                _id: null,
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/appointment_detail.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/headerAfterLogin.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/afterLoginSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/barberController.js',
                            'js/services/barber.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('appointmentDetailconfirm', {
            url: '/appointmentdetailconfirm',
            views: {
                "homeDash": {
                    templateUrl: 'partials/appointment_detail_confirm.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('sendinvitation', {
            url: '/sendinvitation',
            views: {
                "homeDash": {
                    templateUrl: 'partials/sendinvitation.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        // shop Started
        .state('barbershopdashboard', {
            url: '/shopdashboard',
            views: {
                "homeDash": {
                    templateUrl: 'partials/barbershopdashboard.html',
                    controller: "shopCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_shop_header.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barbershopSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/shopController.js',
                            'js/services/shop.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('chairaction', {
            url: '/chairaction/:id/:name',
            params: {
                id: null,
                name: null
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/chairaction.html',
                    controller: "shopCtrl"
                },
                "header": {
                    templateUrl: 'partials/barber_shop_header.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barbershopSideBar.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/shopController.js',
                            'js/services/shop.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('contact', {
            url: '/contact',
            templateUrl: 'partials/contact.html',
            controller: 'ContactCtrl'
        })

        .state('account', {
                url: '/account',
                templateUrl: 'partials/profile.html',
                controller: 'ProfileCtrl',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('shop', {
                url: '/shop',
                templateUrl: './../profile.html',
                controller: 'shopCtrl',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .state('forgot', {
                url: '/forgot',
                views: {
                    "home": {
                        templateUrl: 'partials/forgot.html',
                        controller: 'ForgotCtrl'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['js/controllers/forgot.js',
                                'js/services/account.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }],
                    skipIfAuthenticated: skipIfAuthenticated
                }
            })
            .state('resetToken', {
                url: '/reset/:token',
                templateUrl: 'partials/reset.html',
                controller: 'ResetCtrl',
                resolve: {
                    skipIfAuthenticated: skipIfAuthenticated
                }
            })
            .state('barberShops', {
                url: '/barbershops',
                templateUrl: 'partials/barbershops.html',
                controller: 'ShopCtrl'
            })
            .state('barbers', {
                url: '/barbers',
                templateUrl: 'partials/barbers.html',
                controller: 'ShopCtrl'
            })
            .state('pageNotFound', {
                url: '/partials/pageNotFound',
                views: {
                    "home": {
                        templateUrl: 'partials/404.html'
                    }
                }
            })

        .state('requestchair', {
            url: '/requestchair',
            views: {
                "homeDash": {
                    templateUrl: 'partials/requestchair.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('sendrequestchair', {
            url: '/sendrequestchair',
            views: {
                "homeDash": {
                    templateUrl: 'partials/sendrequestchair.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('requestchairsent', {
            url: '/requestchairsent',
            views: {
                "homeDash": {
                    templateUrl: 'partials/requestchairsent.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })

        .state('managerequest', {
            url: '/managerequest',
            views: {
                "homeDash": {
                    templateUrl: 'partials/managerequest.html'
                },
                "header": {
                    templateUrl: 'partials/barber_header_after_login.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barberSideBar.html'
                }
            }
        })



        .state('barbershop_manage_request', {
            url: '/barbershop_manage_request',
            views: {
                "homeDash": {
                    templateUrl: 'partials/barbershop_manage_request.html'
                },
                "header": {
                    templateUrl: 'partials/barber_shop_header.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barbershopSideBar.html'
                }
            }
        })


        .state('financialcenter', {
            url: '/financialcenter',
            views: {
                "homeDash": {
                    templateUrl: 'partials/financialcenter.html'
                },
                "header": {
                    templateUrl: 'partials/barber_shop_header.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barbershopSideBar.html'
                }
            }
        })

        .state('contactbarbrDO', {
            url: '/contactbarbrDO',
            views: {
                "homeDash": {
                    templateUrl: 'partials/contactbarbrDO.html'
                },
                "header": {
                    templateUrl: 'partials/barber_shop_header.html',
                    controller: "HeaderCtrl"
                },
                "sideBar": {
                    templateUrl: 'partials/barbershopSideBar.html'
                }
            }
        });



        $urlRouterProvider.otherwise('pageNotFound');
        $authProvider.loginUrl = '/api/v1/login';
        $authProvider.signupUrl = '/api/v1/signup';
        $authProvider.facebook({
            url: '/auth/facebook',
            clientId: '653227411528324'
        });
        $authProvider.google({
            url: '/auth/google',
            clientId: '73291812238-aekh50otlf7b5duqanlvo2q1p2o8e4m9.apps.googleusercontent.com'
        });

        function skipIfAuthenticated($state, $auth, $q) {
            var deferred = $q.defer();
            if ($auth.isAuthenticated()) {
                setTimeout(function() {
                    deferred.resolve()
                    $state.go('dashboard');
                }, 0);
                return deferred.promise;
            }
        }

        function loginRequired($state, $auth, $q) {
            var deferred = $q.defer();
            if (!$auth.isAuthenticated()) {
                setTimeout(function() {
                    deferred.resolve()
                    $state.go('home');
                }, 0);
                return deferred.promise;
            }
        }
    })

.directive('checkImage', function($http) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                attrs.$observe('ngSrc', function(ngSrc) {
                    console.log("ngSrc", ngSrc);
                    $http.get(ngSrc).success(function(response) {
                        console.log("response in appjs", response);
                    }).error(function() {
                        // alert('image not exist');
                        element.attr('src', 'http://dhakaprice.com/images/No-image-found.jpg'); // set default image
                    });
                });
            }
        };
    })
    .run(['$rootScope', '$q', '$state', '$auth', '$window', function($rootScope, $q, $state, $auth, $window) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            console.log(toState.url);
             let loggedInUser = JSON.parse($window.localStorage.user)
            console.log("user_type",loggedInUser.user_type)
            // Following if will allow only Landing site routes 
            if (toState.url == '/' || toState.url == '/barber' || toState.url == '/shops') {
                var deferred = $q.defer();
                if ($auth.isAuthenticated()) {
                    setTimeout(function() {
                        deferred.resolve()
                        $state.go('dashboard');
                    }, 0);
                    return deferred.promise;
                }
            }
            // Following if will allow only customer routes
            if (toState.url == '/dashboard' || toState.url == '/shopContainsBarbers/:_id' || toState.url == '/home' || toState.url == '/book/:shop_id/:barber_id' || toState.url == '/profile' || toState.url == '/pending-confirmation/:_id' || toState.url == '/gallery' || toState.url =='/appointmentdetail/:_id') {
                var deferred = $q.defer();
                if (loggedInUser.user_type == 'customer') {
                    console.log("inside customer");
                    if (!$auth.isAuthenticated()) {
                        setTimeout(function() {
                            deferred.resolve()
                            $state.go('home');
                        }, 0);
                        return deferred.promise;
                    }
                    else{
                        setTimeout(function() {
                            deferred.resolve()
                            $state.go(toState.url);
                        }, 0);
                         return deferred.promise;
                    }
                } else {
                    setTimeout(function() {
                        deferred.resolve()
                        $state.go('pageNotFound')
                    }, 0);
                    return deferred.promise;
                }
            }
            // Following if will allow only barbers routes
            if (toState.url == '/dashboardOfBarber' || toState.url == '/searchchair' || toState.url == '/manageservices' || toState.url == '/addservice' || toState.url == '/chairs/:_id' || toState.url == '/reschedule/:_id' || toState.url == '/appointmentdetail/:_id' || toState.url == '/appointmentdetailconfirm' || toState.url == '/sendinvitation') {
                var deferred = $q.defer();
                if (loggedInUser.user_type == 'barber') {
                    console.log("inside customer");
                    if (!$auth.isAuthenticated()) {
                        setTimeout(function() {
                            deferred.resolve()
                            $state.go('home');
                        }, 0);
                        return deferred.promise;
                    }
                    else{
                        setTimeout(function() {
                            deferred.resolve()
                            $state.go(toState.url);
                        }, 0);
                         return deferred.promise;
                    }
                } else {
                    setTimeout(function() {
                        deferred.resolve()
                        $state.go('pageNotFound')
                    }, 0);
                    return deferred.promise;
                }
            }
            // Following if will allow only shop routes
            if (toState.url == '/shopdashboard' || toState.url == '/chairaction/:id/:name') {
                var deferred = $q.defer();
                if (loggedInUser.user_type == 'shop') {
                    console.log("inside customer");
                    if (!$auth.isAuthenticated()) {
                        setTimeout(function() {
                            deferred.resolve()
                            $state.go('home');
                        }, 0);
                        return deferred.promise;
                    }
                    else{
                        setTimeout(function() {
                            deferred.resolve()
                            $state.go(toState.url);
                        }, 0);
                         return deferred.promise;
                    }
                } else {
                    setTimeout(function() {
                        deferred.resolve()
                        $state.go('pageNotFound')
                    }, 0);
                    return deferred.promise;
                }            } else {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve()
                    $state.go('pageNotFound')
                }, 0);
                return deferred.promise;
            }

        })
    }]);