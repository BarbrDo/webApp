angular.module('BarbrDoApp')
  .controller('subScriptionCtrl', function($rootScope, shop, $scope, $location, $stateParams,$state) {
    $scope.cardDetails = {};
    $scope.stripeCallback = function(code, result) {
      if (result.error) {
        alert('it failed! error: ' + result.error.message);
      } else {
        alert('success! token: ' + result.id);
      }
    };
    
    $scope.featuringPlans = function() {
      shop.plans().then(function(response) {
        $scope.plans = response.data.data;
      })
    }
    $scope.submitPayment = function() {
      let myobj = {
        card_number:$scope.cardDetails.number,
        month:$scope.cardDetails.month.substr(0,2),
        year:$scope.cardDetails.month.substr(3,7),
        cvc:$scope.cardDetails.cvc,
        plan:$scope.cardDetails.selectPrice
      }
      alert(JSON.stringify(myobj))
      shop.subScribe(myobj).then(function(response){

      })
    }
  });