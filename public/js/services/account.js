angular.module('BarbrDoApp')
  .factory('Account', function($http,$window) {
    if($window.localStorage.user){
     var obj = JSON.parse($window.localStorage.user); 
    }
    
    return {
      updateProfile: function(data) {
        return $http.put('/api/v1/account', data);
      },
      changePassword: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/account',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      deleteAccount: function() {
        return $http.delete('/api/v1/account');
      },
      forgotPassword: function(data) {
        return $http.post('/api/v1/forgot', data);
      },
      resetPassword: function(data) {
        return $http.post('/api/v1/reset/'+data.token, data);
      }
    };
  });