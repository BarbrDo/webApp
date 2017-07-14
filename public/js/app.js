angular.module('BarbrDoApp', ['ui.router', 'satellizer', 'slick', 'oc.lazyLoad', 'ngMask', 'ngTable', 'alexjoffroy.angular-loaders', 'uiGmapgoogle-maps', 'rzModule', 'ngFileUpload', 'uiSwitch', 'toastr', 'checklist-model', 'angular-input-stars', 'angularPayments', 'geolocation', 'mwl.calendar', 'ui.bootstrap', 'colorpicker.module'])
    .config(
        ['uiGmapGoogleMapApiProvider', function(GoogleMapApiProviders) {
            GoogleMapApiProviders.configure({
                china: true
            });
        }])
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $authProvider) {
        // Stripe.setPublishableKey('sk_test_qOMUshSkdRmS82HGI1ZzJzHy');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $stateProvider
            .state('home', {
                url: '/',
                views: {
                    "home": {
                        templateUrl: 'partials/home.html'
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html'
                    },
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: 'HeaderCtrl'
                    }
                },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/subScription.js',
                            'js/services/shop.js','/js/services/account.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
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
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['/js/services/account.js']
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })
            .state('shopHome', {
                url: '/shops',
                views: {
                    "home": {
                        templateUrl: 'partials/barberShopHome.html'
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html'
                    },
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: 'HeaderCtrl'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['/js/services/account.js']
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
                }
            })

        .state('subScription', {
            url: '/subScribe/:_id',
            params: {
                _id: null
            },
            views: {
                "header": {
                    templateUrl: 'partials/header.html',
                    controller: "HeaderCtrl"
                },
                "home": {
                    templateUrl: 'partials/subscribe.html',
                    controller: "subScriptionCtrl"
                },
                "footer": {
                    templateUrl: 'partials/footer.html'
                }
            },
            resolve: {
                lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                    var deferred = $q.defer();
                    $ocLazyLoad.load({
                        name: 'BarbrDoApp',
                        files: ['js/controllers/subScription.js',
                            'js/services/shop.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
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
                }]
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
                    }]
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

        .state('upcomingdetail', {
            url: '/upcoming_appointment_details/:id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/upcoming_details.html',
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

         .state('contactbarber', {
            url: '/contact_barber/:id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/contact_barber.html',
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

        

        .state('facebookSignup', {
            url: '/facebook/signup',
            views: {
                "homeDash": {
                    templateUrl: 'partials/facebook_signup.html'
                }
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

        .state('viewShopProfile', {
            url: '/viewshopprofile',
            views: {
                "homeDash": {
                    templateUrl: 'partials/shop-profile.html',
                    controller: "ProfileCtrl"
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

        .state('editShopProfile', {
            url: '/editshopprofile',
            views: {
                "homeDash": {
                    templateUrl: 'partials/profile.html',
                    controller: "ProfileCtrl"
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

        .state('viewBarberProfile', {
            url: '/viewbarberprofile',
            views: {
                "homeDash": {
                    templateUrl: 'partials/profile.html',
                    controller: "ProfileCtrl"
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

        .state('barberInfo', {
            url: '/barber_info/:_id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/view_barber_profile.html',
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

        .state('appointmentDetail', {
            url: '/appointmentdetail/:_id',
            params: {
                _id: null
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
                    console.log("yeh sunakshi ");
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


        // Barbers URL's from here

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
                }]
            }
        })

        .state('subScribe', {
            url: '/subScription',
            params: {
                _id: null
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/subscribe.html',
                    controller: "subScriptionCtrl"
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
                        files: ['js/controllers/subScription.js',
                            'js/services/shop.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
            }
        })

        .state('appointmentDetailOfBarber', {
            url: '/appointmentdetails/:_id',
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

        .state('markComplete', {
            url: '/markAsComplete/:_id',
            params: {
                _id: null,
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/mark_as_complete.html',
                    controller: "barberCtrl"
                },
                "header": {
                    templateUrl: 'partials/headerAfterLogin.html',
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
                }]
            }
        })


        .state('shoprequester', {
            url: '/View-Requests-By-Shop/:id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/shoprequester.html',
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

        .state('request-chair', {
            url: '/chairs/request',
            views: {
                "homeDash": {
                    templateUrl: 'partials/requestConfirm.html',
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

        .state('events', {
            url: '/events',
            views: {
                "homeDash": {
                    templateUrl: 'partials/event.html',
                    controller: "EventCtrl"
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
                        files: ['/js/controllers/event.js',
                            '/js/controllers/eventHelper.js',
                            '/js/services/customer.js'
                        ]
                    }).then(function() {
                        deferred.resolve();
                    });
                    return deferred.promise;
                }]
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

        .state('requestorgallery', {
            url: '/barberGallery/:id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/requestor_gallery.html',
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

        .state('shopGallery', {
            url: '/shop/gallery',
            views: {
                "homeDash": {
                    templateUrl: 'partials/shop_gallery.html',
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

        .state('chairwithbarber', {
            url: '/chairwithbarber/:id/:name',
            params: {
                id: null,
                name: null
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/chair_with_barber.html',
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


        .state('search_barber', {
            url: '/search_barber/:id',
            params: {
                id: null,
                name: null
            },
            views: {
                "homeDash": {
                    templateUrl: 'partials/search_barber.html',
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
                controller: 'ProfileCtrl'
            })
            .state('shop', {
                url: '/shop',
                templateUrl: './../profile.html',
                controller: 'shopCtrl'
            })
            // .state('forgot', {
            //     url: '/forgot',
            //     views: {
            //         "header": {
            //             templateUrl: 'partials/header.html',
            //             controller: "HeaderCtrl"
            //         },
            //         "home": {
            //             templateUrl: 'partials/forgot.html',
            //             controller: 'ForgotCtrl'
            //         },
            //         "footer": {
            //             templateUrl: 'partials/footer.html',
            //             controller: 'ForgotCtrl'
            //         }
            //     },
            //     resolve: {
            //         lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
            //             var deferred = $q.defer();
            //             $ocLazyLoad.load({
            //                 name: 'BarbrDoApp',
            //                 files: ['js/controllers/forgot.js',
            //                     'js/services/account.js'
            //                 ]
            //             }).then(function() {
            //                 deferred.resolve();
            //             });
            //             return deferred.promise;
            //         }]
            //     }
            // })

        .state('accountActivate', {
            url: '/account/verification/:email/:random',
            params: {
                email: null,
                random: null
            },
            views: {
                "home": {
                    templateUrl: 'partials/account_activate.html',
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
                }]
            }
        })

        .state('resetToken', {
                url: '/reset/:token',
                views: {
                    "header": {
                        templateUrl: 'partials/header.html',
                        controller: "HeaderCtrl"
                    },
                    "home": {
                        templateUrl: 'partials/reset.html',
                        controller: 'ResetCtrl'
                    },
                    "footer": {
                        templateUrl: 'partials/footer.html',
                        controller: 'ForgotCtrl'
                    }
                },
                resolve: {
                    lazy: ['$ocLazyLoad', '$q', function($ocLazyLoad, $q) {
                        var deferred = $q.defer();
                        $ocLazyLoad.load({
                            name: 'BarbrDoApp',
                            files: ['js/controllers/reset.js',
                                'js/services/account.js'
                            ]
                        }).then(function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }]
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
                    templateUrl: 'partials/managerequest.html',
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



        .state('barbershop_manage_request', {
            url: '/barbershop_manage_request',
            views: {
                "homeDash": {
                    templateUrl: 'partials/barbershop_manage_request.html',
                    controller: 'shopCtrl'
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

        .state('manage_calender', {
            url: '/shop/calender',
            views: {
                "homeDash": {
                    templateUrl: 'partials/manage_calender.html',
                    controller: 'shopCtrl'
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

        .state('requester-details', {
            url: '/requester-detail/:id',
            views: {
                "homeDash": {
                    templateUrl: 'partials/requester-detail.html',
                    controller: 'shopCtrl'
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

        .state('financialcenter', {
            url: '/financialcenter',
            views: {
                "homeDash": {
                    templateUrl: 'partials/financialcenter.html',
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
    })

.directive('checkImage', function($http) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                attrs.$observe('ngSrc', function(ngSrc) {
                    $http.get(ngSrc).success(function(response) {}).error(function() {
                        element.attr('src', 'http://dhakaprice.com/images/No-image-found.jpg'); // set default image
                    });
                });
            }
        };
    })
    .run(['$rootScope', '$q', '$state', '$auth', '$window', 'toastr', function($rootScope, $q, $state, $auth, $window, toastr) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            // Following if will allow only Landing site routes 
            if (toState.url == '/account/verification/:email/:random' || toState.url == '/reset/:token' || toState.url == '/subScribe/:_id') {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve()
                        //                    $state.go(toState.name);
                }, 0);
                return deferred.promise;
            } else if (toState.url == '/' || toState.url == '/barber' || toState.url == '/shops' || toState.url == '/forgot') {
                var deferred = $q.defer();
                if ($auth.isAuthenticated()) {
                    setTimeout(function() {
                        deferred.resolve()
                        $state.go('dashboard');
                    }, 0);
                    return deferred.promise;
                } else {
                    setTimeout(function() {
                        deferred.resolve()
                            // $state.go(toState.name);
                    }, 0);
                    return deferred.promise;
                }
            } else if ($window.localStorage.user) {
                var loggedInUser = JSON.parse($window.localStorage.user);
                // Following if will allow only customer routes
                if (toState.url == '/dashboard' || toState.url == '/shopContainsBarbers/:_id' || toState.url == '/home' || toState.url == '/book/:shop_id/:barber_id' || toState.url == '/profile' || toState.url == '/pending-confirmation/:_id' || toState.url == '/gallery' || toState.url == '/appointmentdetail/:_id' || toState.url == '/barber_info/:_id') {
                    var deferred = $q.defer();
                    // console.log(toState.name);
                    if (loggedInUser.user_type == 'customer') {
                        if (!$auth.isAuthenticated()) {
                            setTimeout(function() {
                                deferred.resolve()
                                $state.go('home');
                            }, 0);
                            return deferred.promise;
                        } else {
                            setTimeout(function() {
                                deferred.resolve()
                                    // $state.go(toState.name);
                            }, 0);
                            return deferred.promise;
                        }
                    } else {
                        setTimeout(function() {
                            deferred.resolve()
                            $auth.logout();
                            delete $window.localStorage.user;
                            toastr.info('Please Login');
                            $state.go('home');
                            // $state.go('pageNotFound')
                        }, 0);
                        return deferred.promise;
                    }
                }
                // Following if will allow only barbers routes
                if (toState.url == '/dashboardOfBarber' || toState.url == '/searchchair' || toState.url == '/manageservices' || toState.url == '/addservice' || toState.url == '/chairs/:_id' || toState.url == '/reschedule/:_id' || toState.url == '//appointmentdetails/:_id' || toState.url == '/appointmentdetailconfirm' || toState.url == '/sendinvitation' || toState.url == '/barberGallery' || toState.url == '/managerequest') {
                    var deferred = $q.defer();
                    if (loggedInUser.user_type == 'barber') {
                        if (!$auth.isAuthenticated()) {
                            setTimeout(function() {
                                deferred.resolve()
                                $state.go('home');
                            }, 0);
                            return deferred.promise;
                        } else {
                            setTimeout(function() {
                                deferred.resolve()
                                    // $state.go(toState.name);
                            }, 0);
                            return deferred.promise;
                        }
                    } else {
                        setTimeout(function() {
                            deferred.resolve()
                            $auth.logout();
                            delete $window.localStorage.user;
                            toastr.info('Please Login');
                            $state.go('home');
                            // $state.go('pageNotFound')
                        }, 0);
                        return deferred.promise;
                    }
                }
                // Following if will allow only shop routes
                if (toState.url == '/shopdashboard' || toState.url == '/chairaction/:id/:name' || toState.url == '/financialcenter' || toState.url == '/barbershop_manage_request' || toState.url == '/contactbarbrDO') {
                    var deferred = $q.defer();
                    if (loggedInUser.user_type == 'shop') {
                        if (!$auth.isAuthenticated()) {
                            setTimeout(function() {
                                deferred.resolve()
                                $state.go('home');
                            }, 0);
                            return deferred.promise;
                        } else {
                            setTimeout(function() {
                                deferred.resolve()
                                    // $state.go(toState.name);
                            }, 0);
                            return deferred.promise;
                        }
                    } else {
                        setTimeout(function() {
                            deferred.resolve()
                            $auth.logout();
                            delete $window.localStorage.user;
                            toastr.info('Please Login');
                            $state.go('home');
                            // $state.go('pageNotFound')
                        }, 0);
                        return deferred.promise;
                    }
                }
            } else {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve()
                    $state.go('pageNotFound')
                }, 0);
                return deferred.promise;
            }
        })
    }]);
