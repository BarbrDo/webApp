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
      console.log("featuringPlans plans");
      shop.plans().then(function(response) {
        console.log(response)
        $scope.loaderStart = false;
        $scope.plans = response.data.data;
      })
    }
    $scope.subScription = function(data) {
      console.log(data);
      $scope.cardDetails.selectPrice = data.id;
      console.log($scope.cardDetails.selectPrice);
    }

    $scope.submitPayment = function() {
      console.log($window.localStorage.user);
      return false;
      var myobj = {
        user_id: $stateParams._id,
        card_number: $scope.cardDetails.number,
        month: $scope.cardDetails.month.substr(0, 2),
        year: $scope.cardDetails.month.substr(3, 7),
        cvc: $scope.cardDetails.cvc,
        plan: $scope.cardDetails.selectPrice
      }
      shop.subScribe(myobj).then(function(response) {
        toastr.success("subscribe successfully.");
        var obj = {
          "email":response.data.user.email,
          "decrypt":"decrypt"
        }
        $auth.login(obj)
          .then(function(response) {
            toastr.success('Welcome');
            $rootScope.currentUser = response.data.user;
            $window.localStorage.user = JSON.stringify(response.data.user);
            $window.localStorage.imagePath = response.data.imagesPath;
            if (response.data.user.user_type == 'customer') {
              $state.go('upcomingComplete');
            }
            if (response.data.user.user_type == 'barber') {
              $state.go('barberDashboard');
            }
            if (response.data.user.user_type == 'shop') {
              $state.go('barbershopdashboard')
            }
          })
      })
    }



    // Stripe Implementation
    $scope.stripeCall = function() {
      var stripe = Stripe('pk_test_fswpUdU8DBIKbLz1U637jNF7');
      var elements = stripe.elements();
      console.log(elements);
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
        console.log(result);
        var successElement = document.querySelector('.success');
        var errorElement = document.querySelector('.error');
        successElement.classList.remove('visible');
        errorElement.classList.remove('visible');

        if (result.token) {
          // Use the token to create a charge or a customer
          // https://stripe.com/docs/charges
          console.log("token here", result.token.id);
          successElement.querySelector('.token').textContent = result.token.id;
          successElement.classList.add('visible');
           console.log($window.localStorage.user);
      return false;

          var obj = {
            token: result.token.id,
            amount :$scope.annualCost
          }
          customer.chargeCustomer(obj)
            .then(function(response) {
              $scope.profileInfo = response.data.user;
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
        console.log(card,extraDetails);
        stripe.createToken(card, extraDetails).then(setOutcome);
      });
    }
  });