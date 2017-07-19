angular.module('BarbrDoApp')
  .factory('shop', function($http, $window, $rootScope) {
    var obj = {};
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
      forgotPassword: function (data) {
            return $http.post('/api/v1/forgot', data);
        },
      barbers: function(data) {
        if (data.search) {
          return $http({
          method: 'get',
          url: '/api/v1/barbers/available?search=' + data.search,
          data: data,
         headers: {
            'device_latitude': 30.538994,
            'device_longitude': 75.955033
          }
        });
        } else {
          return $http({
          method: 'get',
          url: '/api/v1/barbers/available',
          data: data,
         headers: {
            'device_latitude': 30.538994,
            'device_longitude': 75.955033
          }
        });
        }
      },
      shopInfo: function(data) {
          return $http({
          method: 'get',
          url: '/api/v1/userprofile/' + data.obj._id
        });   
      },
      deleteChair: function(data) {
         return $http({
        method: 'DELETE',
        url: '/api/v1/shops/chair',
        data: data,
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        }
      });
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
      requestBarber: function(shopid, chairid, barber,user_type) {
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
            booking_date: new Date(),
            user_type:user_type   
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
          headers: {
            'user_id': obj._id
          },
          data: {
            chair_request_id: data._id,
            request_type: 'accept'
          }
        })
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
      plans: function(data) {
        return $http.get('/api/v1/stripe/plans', data);
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
          url: '/api/v1/stripe/subscribe',
          data: data,
          headers: {
            'user_id': data.user_id
          }
        }, data);
      },
      allServices: function(data) {
        return $http.get('/api/v1/barber/services');
      },
      barberServices: function(data) {
        return $http.get('/api/v1/barber/services/'+obj._id);
      },
      finacialCenter: function(data) {
        console.log(data)
        return $http({
          method: 'get',
           url: '/api/v1/shops/sale/'+data.shop_id+'/'+data.startdate+'/'+data.enddate,
          headers: {
            'user_id': obj._id
          }
        });
      },
      requestRemoveBarber: function(data) {
        return $http.post('/api/v1/shop/removebarber',data);
      },
      ContactBarbrdo: function(data) {
        console.log("here")
        return $http.post('/api/v1/contact',data);
      }
    }
  });