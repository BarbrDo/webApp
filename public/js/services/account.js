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
      shopList: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/shops',
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        },data);

        // return $http.get('/api/v1/shops', data);
      },
       barberAll: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/barbers',
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        },data);
      },
      barberService: function(data) {
        return $http.get('/api/v1/barberServices/'+data._id, data);
      },
      barberList: function(data) {
        return $http.get('/api/v1/shops/barbers/'+data._id, data);
      },
      barbrProfile: function(data) {
        return $http.get('/api/v1/barber/'+data._id, data);
      },
      timeSlots: function(data) {
        return $http.get('/api/v1/timeslots', data);
      },
      resetPassword: function(data) {
        return $http.post('/api/v1/reset', data);
      }
    };
  });