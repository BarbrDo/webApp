angular.module('BarbrDoApp')
  .factory('shop', function($http, $window, $rootScope) {
    var obj = {};
    // console.log("$rootScope.currentUser", $rootScope.currentUser);
    if ($window.localStorage.user) {
      obj = JSON.parse($window.localStorage.user);
    }
    return {
      addChair: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/shops/chair',
          data: data,
          headers: {
            'user_id': obj._id
          }
        });
      },
      barbers: function(data) {
        if (data.search) {
          return $http.get('/api/v1/allbarbers?search=' + data.search, data);
        } else {
          return $http.get('/api/v1/allbarbers');
        }
      },
      shopInfo: function(data) {
        return $http({
          method: 'get',
          url: '/api/v1/userprofile/' + data.obj._id,
          data: data
        });
      },
      deleteChair: function(data) {
        return $http.delete('/api/v1/shops/chair', data);
      },
      saveSplitFair: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/managechair',
          data: data,
          headers: {
            'user_id': obj._id
          }
        });
      },
      saveWeeklyFair: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/managechair',
          data: data,
          headers: {
            'user_id': obj._id
          }
        });
      },
      postToAllBarbers: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/postChairToAllBarbers',
          data: data,
          headers: {
            'user_id': obj._id
          }
        });
      },
      markBooked: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/markchairasbooked/' + data.chair_id,
          headers: {
            'user_id': obj._id
          }
        });
      },
      fbSignup: function(data) {
        return $http.post('/api/v1/signup', data);
      },
      chairRequest: function(data) {
        return $http({
          method: 'get',
          url: '/api/v1/shops/barberchairrequests/' + data,
          data: data
        });
      },
      requestBarber: function(shopid, chairid, barber) {
        return $http({
          method: 'post',
          url: '/api/v1/requestchair',
          headers: {
            'user_id': obj._id
          },
          data: {
            barber_id: barber._id,
            chair_id: chairid,
            shop_id: shopid,
            booking_date: "2017-07-20"
          }
        })
      },
      chairDetail: function(data) {
        return $http.get('/api/v1/chairdetail/' + data, data);
      },
      acceptRequest: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/acceptrequest',
          data: {
            chair_request_id: data._id,
            request_type: 'accept'
          },
          headers: {
            'user_id': obj._id
          }
        });
      },
      declineRequest: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/acceptrequest',
          data: {
            chair_request_id: data._id,
            request_type: 'decline'
          },
          headers: {
            'user_id': obj._id
          }
        });
      },
      barberDetail: function(data) {
        return $http.get('/api/v1/barberdetail/' + data, data);
      },
      deleteChair: function(data) {
        return $http({
          method: 'delete',
          url: '/api/v1/shops/chair',
          data: data,
          headers: {
            'user_id': obj._id
          }
        }, data);
      },
      plans: function(data) {
        return $http.get('/api/v1/plans', data);
      },
      deleteImage: function(data) {
        return $http({
          method: 'delete',
          url: '/api/v1/barber/gallery/' + data._id,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            'user_id': obj._id //obj._id
          }
        });
      },
      subScribe: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/subscribe',
          data: data,
          headers: {
            'user_id': data.user_id
          }
        }, data);
      }
    }
  });