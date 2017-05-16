angular.module('BarbrDoApp')
  .controller('ShopCtrl', function($scope, $rootScope, $location, Account, $routeParams) {
    $scope.dollarAmmount = 0.00;
    $scope.annualCost = "$" + $scope.dollarAmmount;

    $rootScope.currentId = $routeParams.id;

    var obj = {
      'latitude': "30.708225",
      'longitude': "76.7029445"
    }
    Account.shopList(obj)
      .then(function(data) {
        $scope.shops = data.data.data;
      });


    $scope.shopdetails = function(shop) {
      Account.barberList(shop)
        .then(function(response) {
          $rootScope.shopname = shop;
          $rootScope.barbers = response.data.data.barber;


        });
    };

    Account.barberAll(obj)
      .then(function(response) {
        $rootScope.allbarbers = response.data.data;

      });


    $scope.appointment = function(barber) {
      Account.timeSlots(barber)
        .then(function(response) {
          $rootScope.time = response.data.data;
          $rootScope.barber = barber;
          
        });

      Account.barberService(barber)
        .then(function(response) {
          $rootScope.barberservice = response.data.data;
          $rootScope.barberdetail = barber;
        });
    };
    
   
       $scope.selected = [
    {
     
    }
  ];
    $scope.cost = function(amt, e , value) {

      if (e.target.checked)
      {
        $scope.names = e.target.value;
       
        $scope.dollarAmmount = $scope.dollarAmmount + amt;
        $scope.selected.push(value) ; 
        
      }
      else
      {
        $scope.dollarAmmount = $scope.dollarAmmount - amt;
      
      for(var i=0 ; i < $scope.selected.length; i++) {
        if($scope.selected[i]._id == value._id){
          $scope.selected.splice(i,1);
        }
      }     
      } 
      $scope.annualCost = "$" + $scope.dollarAmmount;
      
    };

    $scope.timeslot = function(time) {
      $rootScope.selectedtime = time ;
      console.log("selectedtime",time);
    };

    $scope.toggle = function (first, second) {
        $('#'+first).collapse ('hide');
        $('#'+second).collapse ('show');
    }

  });