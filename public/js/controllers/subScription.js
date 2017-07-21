angular.module('BarbrDoApp')
  .controller('subScriptionCtrl', function($rootScope, shop, $scope, $location, $stateParams, $state, toastr, $window,$auth) {
    $scope.cardDetails = {};
    $scope.loaderStart = true;
    $scope.stripeCallback = function(code, result) {
      if (result.error) {
        alert('it failed! error: ' + result.error.message);
      } else {
        alert('success! token: ' + result.id);
      }
    };

    $scope.featuringPlans = function() {
      shop.plans().then(function(response) {
        $scope.loaderStart = false;
        $scope.plans = response.data.data;
      })
    }
    $scope.subScription = function(data) {
      $scope.cardDetails.selectPrice = data.id;
      $scope.cardDetails.price = data.amount/100;
    }


    // Stripe Implementation
    $scope.stripeCall = function() {
      var stripe = Stripe('pk_test_fswpUdU8DBIKbLz1U637jNF7');
      var elements = stripe.elements();
      var card = elements.create('card', {
        style: {
          base: {
            iconColor: '#666EE8',
            color: '#31325F',
            lineHeight: '40px',
            fontWeight: 300,
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSize: '15px',
            '::placeholder': {
              color: '#CFD7E0',
            },
          },
        }
      });
      card.mount('#card-element');

      function setOutcome(result) {
        var successElement = document.querySelector('.success');
        var errorElement = document.querySelector('.error');
        successElement.classList.remove('visible');
        errorElement.classList.remove('visible');

        if (result.token) {
          // Use the token to create a charge or a customer
          // https://stripe.com/docs/charges
          successElement.querySelector('.token').textContent = result.token.id;
          successElement.classList.add('visible');
          var userWindow = {};
          if($stateParams._id){
             userWindow = {"_id":$stateParams._id}
          }
          else{
             userWindow = JSON.parse($window.localStorage.user);
          }
          var obj = {
            token: result.token.id,
            amount :$scope.cardDetails.price*100,
            user_id:userWindow._id
          }
          $('#myModal').modal('hide');
          shop.subScribe(obj).then(function(response) {
            if($stateParams._id){

             toastr.success("subscription successfull. Please login.");
             $state.go("home");
            }
            }).catch(function(e){
              toastr.error("Payment not done.Please try again later!")
            })
        } else if (result.error) {
          errorElement.textContent = result.error.message;
          errorElement.classList.add('visible');
        }
      }

      card.on('change', function(event) {
        setOutcome(event);
      });

      document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        var form = document.querySelector('form');
        var extraDetails = {
          name: form.querySelector('input[name=cardholder-name]').value,
        };
        stripe.createToken(card, extraDetails).then(setOutcome);
      });
    }
  });