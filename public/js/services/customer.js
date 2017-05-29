angular.module('BarbrDoApp')
  .factory('customer', function($http) {
    return {
      shopList: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/shops',
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        },data);
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
      shopContainsBarbers: function(data) {
        return $http.get('/api/v1/shops/barbers/'+data._id, data);
      },
      barbrProfile: function(data) {
        return $http.get('/api/v1/barber/'+data._id, data);
      },
      timeSlots: function(data) {
        return $http.get('/api/v1/timeslots', data);
      }
    };
  });