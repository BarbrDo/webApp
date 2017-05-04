angular.module('BarbrDoApp')
  .factory('Account', function($http) {
    return {
      updateProfile: function(data) {
        return $http.post('/api/v1/account', data);
      },
      changePassword: function(data) {
        return $http.put('/api/v1/account', data);
      },
      deleteAccount: function() {
        return $http.delete('/api/v1/account');
      },
      forgotPassword: function(data) {
        return $http.post('/api/v1/forgot', data);
      },
      resetPassword: function(data) {
        return $http.post('/api/v1/reset', data);
      }
    };
  });