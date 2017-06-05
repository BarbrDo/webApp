"use strict";

var app_admin = angular.module('barbrdo', ['ui.router', 'ui.bootstrap', 'angularModalService','rzModule', "chart.js"]);

app_admin.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app_admin.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/dashboard');
    
    $stateProvider
    
    // Dashboard
        .state('dashboard', {
            url: '/dashboard',
            controller: "AdminCtrl",
            templateUrl: 'templatesAdmin/dashboard.html'
        })

        // view_companies
        .state('view_companies', {
            url: '/view-companies',
            templateUrl: 'templatesAdmin/company-list.html'
        })

       .state('edit_barbers', {
            url: '/barbers/edit',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/edit-barber.html"
           
        })

       .state('barbers', {
            url: '/barbers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/adminBarber.html"
            // resolve: {
            //      checklogin: login
            //  }
        })

       .state('editshop', {
            url: '/shop/edit',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/editshop.html"
            // resolve: {
            //      checklogin: login
            //  }
        })

       .state('editchair', {
            url: '/chair/edit',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/editchair.html"
            // resolve: {
            //      checklogin: login
            //  }
        })

        .state('shops', {
            url: '/shops',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/adminShop.html"
            // resolve: {
            //      checklogin: login
            //  }
        })

        .state('chairs', {
            url: '/chairs/:id',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/chairsdetails.html"
            // resolve: {
            //      checklogin: login
            //  }
        })

        .state('barbdetail', {
            url: '/barbdetail',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/barberdetails.html"
            // resolve: {
            //      checklogin: login
            //  }
        })

        .state('customers', {
            url: '/customers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/adminCust.html"
          
        })    

        .state('add_barbers', {
            url: '/add_barbers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/addBarber.html"
        
        })     

        .state('add_shops', {
            url: '/add_shops',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/addShop.html"
        
        })      

        .state('add_customers', {
            url: '/add_customers',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/addCustomer.html"
        
        })  

        .state('shopdetail', {
            url: '/shops/details',
            controller: "AdminCtrl",
            templateUrl: "/modalsAdmin/adminHTml/views/shopdetail.html"
        
        })       
  
});

app_admin.config(function (ChartJsProvider) {
  ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
});


/* custom directive*/


app_admin.directive('dropMenus', function(){
    return{
        
        
        link: function(scope, element) {
                 
            element.bind('click', function(e) {
                scope.findParent = element.parent();
                var parentVal = angular.element(scope.findParent);

                if($(parentVal).hasClass('dropdown')){
                     scope.sibiling = element.next();
                    var targetval = angular.element(scope.sibiling);
                    targetval.slideToggle();
                    parentVal.toggleClass('dropdownopen');
                }
                console.log(parentVal);
               

            });
        }
    }

});

/* stick on scroll */

app_admin.directive('setClassWhenAtTop', function ($window) {
    var $win = angular.element($window); // wrap window object as jQuery object

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
                offsetTop = element.offset().top; // get element's top relative to the document

            $win.on('scroll', function (e) {
                if ($win.scrollTop() >= offsetTop) {
                    element.addClass(topClass);
                } else {
                    element.removeClass(topClass);
                }
            });
        }
    };
})