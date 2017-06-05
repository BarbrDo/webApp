angular.module('BarbrDoApp')
  .factory('barber', function($http,$window) {
    var obj = JSON.parse($window.localStorage.user);
    return {
       appointments: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/barber/appointments',
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      appointment: function(data) {
        return $http.get('/api/v1/barber/particularAppointment/'+data._id, data);
      },
      shopsHavingChairs: function(data) {
         return $http({
          method: 'GET',
          url: '/api/v1/shops/chair',
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        },data);
      },
      shopChairs: function(data) {
        return $http.get('/api/v1/shops/chair/'+data._id, data);
      },
      requestChair: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/barber/requestchair',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      confirmAppointment: function(data) {
        return $http.put('/api/v1/barber/confirmappointment/'+data.appointment_id, data);
      },
      reschedule: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/barber/rescheduleappointment/'+data.appointment_id,
          data:data
        },data);
      },
      cancelAppoint: function(data) {
        return $http.put('/api/v1/barber/cancelappointment/'+data.appointment_id, data);
      },
      }
  });