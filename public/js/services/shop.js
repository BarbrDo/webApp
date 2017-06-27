angular.module('BarbrDoApp')
  .factory('shop', function($http,$window) {
    var obj = {};
    if($window.localStorage.user){
       obj = JSON.parse($window.localStorage.user);
    }
    return {
      addChair: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/shops/chair',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      shopInfo: function(data) {
        return $http({
          method: 'get',
          url: '/api/v1/userprofile/'+obj._id,data
        },data);
      },
      deleteChair: function(data) {
        return $http.delete('/api/v1/shops/chair', data);
      },
      saveSplitFair: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/managechair',
          data:data,
          headers: {
            'user_id': obj._id
          }
        });
      },
      saveWeeklyFair: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/managechair',
          data:data,
          headers: {
            'user_id': obj._id
          }
        });
      },
      postToAllBarbers: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/postChairToAllBarbers',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      markBooked: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/markchairasbooked/'+data.chair_id,
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
          url: '/api/v1/shops/barberchairrequests/'+data,
          data:data
        });
      },
      acceptRequest: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/acceptrequest',
          data:{
            chair_request_id: data._id,
            request_type: 'accept'
          },
          headers: {
            'user_id' : obj._id
          }
        });
      },
      deleteChair: function(data) {
        return $http({
          method: 'delete',
          url: '/api/v1/shops/chair',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      plans: function(data) {
        return $http.get('/api/v1/plans', data);
      },
      subScribe: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/subscribe',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      }
      }
  });