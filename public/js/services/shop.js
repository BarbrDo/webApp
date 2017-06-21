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
          url: '/api/v1/shops/chairPercentage',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      saveWeeklyFair: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/weeklyMonthlyChair',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
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
          url: '/api/v1/shops/markChairAsBooked',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
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