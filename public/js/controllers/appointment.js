angular.module('BarbrDoApp')
  .controller('AppointCtrl', function($rootScope,Account,$scope,$location,$routeParams) {

     
    
     $rootScope.currentId = $routeParams.id;
       
    Account.barberService($rootScope.currentId)
            .then(function(response) {
             console.log("barber service",response.data.data);
             $rootScope.barberservice = response.data.data ;
            
            });

    // $scope.paynow = function(shop) {
    // Account.barberService(shop)
    //     .then(function(data) {
    //       $scope.service = data;
    //       console.log("Serv",data);
    //       $location.path('/confirm');
            
    //     });
    //       };

    //       $scope.paylater = function(shop) {
    // Account.barberService(shop)
    //     .then(function(data) {
    //       $scope.service = data;
    //       console.log("Serv",data);
    //       $location.path('/confirm');
            
    //     });
    //       };
    

  });
