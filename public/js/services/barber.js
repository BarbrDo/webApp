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
      }
      }
  });